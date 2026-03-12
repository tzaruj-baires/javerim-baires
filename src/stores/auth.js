import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import bcryptjs from 'bcryptjs'
import * as api from '@/services/api'
import { v4 as uuidv4 } from 'uuid'

// ─── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = () =>
  new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

// ─── Notificaciones ────────────────────────────────────────────────────────────

/**
 * Email a cada dirección de la lista de admins avisando que se registró un nuevo usuario.
 */
const sendRegistrationNotification = async (newUser) => {
  try {
    const notificationEmails = import.meta.env.VITE_ADMIN_USERS
      ? JSON.parse(import.meta.env.VITE_ADMIN_USERS)
      : []

    if (notificationEmails.length === 0) {
      console.error('No hay correos de notificación configurados')
      return
    }

    await Promise.allSettled(
      notificationEmails.map((to) => {
        let res = api.sendEmail(
          'alta_admin',
          to,
          `JaverimBaires [Nuevo Registro]: ${newUser.nickname}`,
          {
            nickname: newUser.nickname,
            email: newUser.email,
            dni: newUser.dni,
            cellphone: newUser.cellphone || '-',
            fecha: formatDate(),
          },
        )
        res.catch((error) => {
          console.error(`Error al enviar notificación a ${to}:`, error)
        })
      }),
    )
  } catch (error) {
    console.error('Error al enviar notificación de registro a administradores:', error)
  }
}

/**
 * Email de bienvenida al usuario recién registrado.
 * Le avisa que su acceso está pendiente y que debe reiniciar sesión una vez aprobado.
 */
const sendWelcomeEmail = async (newUser) => {
  try {
    await api.sendEmail('alta_user', newUser.email, 'Javerim Baires | Bienvenido', {
      nickname: newUser.nickname,
      email: newUser.email,
      dni: newUser.dni,
      fecha: formatDate(),
    })

    /*const res = await api.sendEmail('test', 'matiasp.baires@gmail.com', 'prueba', {
      msj: 'holiwis',
    })*/
  } catch (error) {
    console.error('Error al enviar email de bienvenida:', error)
  }
}

/**
 * Email al usuario avisándole que su nivel de acceso fue cambiado.
 * Se exporta para usarse desde AdminUsers.vue.
 *
 * @param {{ email: string, nickname: string }} user
 * @param {number} newLevel
 * @param {Object} levelNames  - ej: { 0: 'Sin acceso', 1: 'Usuario Básico', ... }
 */
const sendAccessLevelNotification = async (user, newLevel, levelNames) => {
  try {
    const nivelNombre = levelNames[newLevel] ?? 'Desconocido'

    await api.sendEmail(
      'itlevel_changed',
      user.email,
      'Javerim Baires | Cambio en tu nivel de acceso',
      {
        nickname: user.nickname,
        email: user.email,
        nivelNombre,
        nivelNumero: newLevel,
        fecha: formatDate(),
      },
    )
  } catch (error) {
    console.error('Error al enviar notificación de cambio de nivel:', error)
  }
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => user.value !== null)

  const loadUserFromStorage = () => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        user.value = JSON.parse(stored)
      } catch {
        user.value = null
      }
    }
  }

  const register = async (userData) => {
    try {
      if (!userData.email || !userData.password || !userData.cellphone || !userData.dni) {
        throw new Error('Todos los campos son requeridos')
      }

      if ((userData.dni.toString().length >= 7 && userData.dni.toString().length <= 8) === false) {
        throw new Error('DNI debe tener entre 7 y 8 dígitos')
      }

      if (![1, 2, 3].includes(parseInt(userData.it_level || 1))) {
        throw new Error('it_level debe ser entre 1 y 3')
      }

      const mainResponse = await api.getAll('main')
      const usersResponse = await api.getAll('users')
      const mainRecords = mainResponse.data
      const users = usersResponse.data

      const dniInMain = mainRecords.some(
        (record) => parseInt(record.DNI) === parseInt(userData.dni),
      )
      if (!dniInMain) {
        throw new Error('El DNI no está registrado en el sistema. No puedes completar el registro.')
      }

      const dniInUsers = users.some((u) => parseInt(u.dni) === parseInt(userData.dni))
      if (dniInUsers) {
        throw new Error('Este DNI ya tiene una cuenta registrada. Por favor inicia sesión.')
      }

      const emailExists = users.some((u) => u.email === userData.email)
      if (emailExists) {
        throw new Error('Este email ya está registrado. Por favor usa otro email o inicia sesión.')
      }

      const nickname = userData.email.split('@')[0]
      const salt = await bcryptjs.genSalt(10)
      const hash_pwd = await bcryptjs.hash(userData.password, salt)

      const newUser = {
        id: uuidv4(),
        dni: parseInt(userData.dni),
        nickname,
        email: userData.email,
        cellphone: parseInt(userData.cellphone),
        it_level: 0,
        hash_pwd,
      }

      await api.create('users', newUser)

      // Email 1 → admins: aviso de nuevo registro
      await sendRegistrationNotification(newUser)

      // Email 2 → usuario: bienvenida + acceso pendiente
      await sendWelcomeEmail(newUser)

      const userSession = { ...newUser }
      delete userSession.hash_pwd
      user.value = userSession
      localStorage.setItem('user', JSON.stringify(userSession))

      return { success: true, message: 'Usuario registrado exitosamente' }
    } catch (error) {
      console.error('Error en registro:', error)
      throw error
    }
  }

  const login = async (email, password) => {
    try {
      if (!email || !password) {
        throw new Error('Email y contraseña requeridos')
      }

      const response = await api.getAll('users')
      const users = response.data

      const foundUser = users.find((u) => u.email === email)
      if (!foundUser) throw new Error('Usuario no encontrado')

      const isValidPassword = await bcryptjs.compare(password, foundUser.hash_pwd)
      if (!isValidPassword) throw new Error('Contraseña incorrecta')

      const mainResponse = await api.getAll('main')
      const mainData = mainResponse.data
      const mainRecord = mainData.find((m) => m.DNI === foundUser.dni)

      if (!mainRecord) {
        const existingByEmailOrPhone = mainData.some(
          (m) =>
            m.email === foundUser.email ||
            (foundUser.cellphone && m.celular === foundUser.cellphone.toString()),
        )
        if (!existingByEmailOrPhone) {
          await api.create('main', {
            DNI: foundUser.dni,
            email: foundUser.email,
            celular: foundUser.cellphone.toString(),
            nombre: '',
            apellido: '',
            apodo: foundUser.nickname,
            organizacion: '',
            areas: '',
            areas_ref: '',
            mail_operativo: foundUser.email,
            mail_personal: '',
          })
        }
      }

      const userSession = { ...foundUser }
      delete userSession.hash_pwd

      const mainResponseUpdated = await api.getAll('main')
      const mainRecordUpdated = mainResponseUpdated.data.find((m) => m.DNI === foundUser.dni)

      if (mainRecordUpdated) {
        userSession.areas_ref = mainRecordUpdated.areas_ref || ''
        userSession.areas = mainRecordUpdated.areas || ''
        userSession.organizacion = mainRecordUpdated.organizacion || ''
      }

      user.value = userSession
      localStorage.setItem('user', JSON.stringify(userSession))

      return { success: true, message: 'Sesión iniciada correctamente' }
    } catch (error) {
      console.error('Error en login:', error)
      throw error
    }
  }

  const refreshUser = async () => {
    try {
      if (!user.value || !user.value.email) throw new Error('No hay usuario autenticado')

      // ✅ Sincronizar it_level (puede haberlo cambiado un admin)
      const usersResponse = await api.getAll('users')
      const freshUser = usersResponse.data.find((u) => u.email === user.value.email)
      if (freshUser) {
        user.value.it_level = freshUser.it_level ?? 0
      }

      // Sincronizar datos de main
      const mainResponse = await api.getAll('main')
      const mainRecord = mainResponse.data.find((m) => m.DNI === user.value.dni)
      if (mainRecord) {
        user.value.areas_ref = mainRecord.areas_ref || ''
        user.value.areas = mainRecord.areas || ''
        user.value.organizacion = mainRecord.organizacion || ''
      }

      localStorage.setItem('user', JSON.stringify(user.value))
      return { success: true, message: 'Datos actualizados correctamente' }
    } catch (error) {
      console.error('Error al refrescar usuario:', error)
      throw error
    }
  }

  const logout = () => {
    user.value = null
    localStorage.removeItem('user')
  }

  const verifyUserIdentity = async (data) => {
    try {
      const { dni, email } = data
      if (!dni || !email) throw new Error('DNI y email requeridos')

      const response = await api.getAll('users')
      const foundUser = response.data.find((u) => u.dni === parseInt(dni) && u.email === email)
      if (!foundUser)
        throw new Error('Usuario no encontrado. Verifica que tu DNI y email sean correctos')

      sessionStorage.setItem('resetUserData', JSON.stringify({ dni, email }))
      return { success: true, message: 'Identidad verificada' }
    } catch (error) {
      console.error('Error al verificar identidad:', error)
      throw error
    }
  }

  const resetPassword = async (data) => {
    try {
      const { dni, email, newPassword } = data
      if (!dni || !email || !newPassword) throw new Error('Todos los campos son requeridos')

      const response = await api.getAll('users')
      const foundUser = response.data.find((u) => u.dni === parseInt(dni) && u.email === email)
      if (!foundUser) throw new Error('Usuario no encontrado')

      const salt = await bcryptjs.genSalt(10)
      const hash_pwd = await bcryptjs.hash(newPassword, salt)

      await api.update('users', { id: foundUser.id, hash_pwd })
      sessionStorage.removeItem('resetUserData')

      return { success: true, message: 'Contraseña actualizada correctamente' }
    } catch (error) {
      console.error('Error al resetear contraseña:', error)
      throw error
    }
  }

  return {
    user,
    isAuthenticated,
    register,
    login,
    refreshUser,
    logout,
    verifyUserIdentity,
    resetPassword,
    loadUserFromStorage,
  }
})

// Exportar para AdminUsers.vue
export { sendAccessLevelNotification }
