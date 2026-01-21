import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import bcryptjs from 'bcryptjs'
import * as api from '@/services/api'
import { v4 as uuidv4 } from 'uuid'

// Función auxiliar para enviar notificación de registro
const sendRegistrationNotification = async (newUser) => {
  try {
    const notificationEmailsStr = localStorage.getItem('notificationEmails') || ''
    const notificationEmails = notificationEmailsStr
      .split('\n')
      .map((email) => email.trim())
      .filter((email) => email.length > 0)

    if (notificationEmails.length === 0) {
      console.log('No hay correos de notificación configurados')
      return
    }

    // Preparar contenido del email
    const emailContent = {
      to: notificationEmails.join(','),
      subject: `Nuevo usuario registrado - ${newUser.nickname}`,
      body: `
Un nuevo usuario se ha registrado en la plataforma:

Datos del usuario:
- DNI: ${newUser.dni}
- Email: ${newUser.email}
- Nickname: ${newUser.nickname}
- Teléfono: ${newUser.cellphone}
- Nivel actual: Sin acceso (requiere aprobación)

Accede a la plataforma para otorgarle acceso.
      `,
    }

    // Log del email que se enviaría (aquí se integrará con servicio de emails real)
    console.log('Notificación de registro (simulated):', emailContent)
  } catch (error) {
    console.error('Error al enviar notificación de registro:', error)
    // No lanzamos error para no interrumpir el registro del usuario
  }
}

// Función para notificar cambio de nivel de acceso
const sendAccessLevelNotification = async (user, newLevel, levelNames) => {
  try {
    const levelName = levelNames[newLevel] || 'Desconocido'
    const emailContent = {
      to: user.email,
      subject: `Tu nivel de acceso ha sido actualizado - ${levelName}`,
      body: `
Hola ${user.nickname},

Tu nivel de acceso en la plataforma ha sido actualizado.

Detalles:
- Usuario: ${user.email}
- Nuevo nivel: ${levelName}
- Fecha: ${new Date().toLocaleDateString('es-AR')}

Por favor, inicia sesión nuevamente para que los cambios tengan efecto.

Si tienes dudas, contacta al administrador.
      `,
    }

    // Log del email que se enviaría (aquí se integrará con servicio de emails real)
    console.log('Notificación de cambio de nivel (simulated):', emailContent)
  } catch (error) {
    console.error('Error al enviar notificación de cambio de nivel:', error)
    // No lanzamos error para no interrumpir la actualización
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => user.value !== null)

  // Cargar usuario del localStorage al iniciar
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

  // Registrar nuevo usuario
  const register = async (userData) => {
    try {
      // Validaciones
      if (!userData.email || !userData.password || !userData.cellphone || !userData.dni) {
        throw new Error('Todos los campos son requeridos')
      }

      if (userData.dni.toString().length !== 8) {
        throw new Error('DNI debe tener 8 dígitos')
      }

      if (![1, 2, 3].includes(parseInt(userData.it_level || 1))) {
        throw new Error('it_level debe ser entre 1 y 3')
      }

      // Verificar si el email ya existe
      const response = await api.getAll('users')
      const users = response.data
      const emailExists = users.some((u) => u.email === userData.email)
      if (emailExists) {
        throw new Error('Este email ya está registrado. Por favor usa otro email o inicia sesión.')
      }

      // Generar nickname (email sin dominio)
      const nickname = userData.email.split('@')[0]

      // Hash de la contraseña
      const salt = await bcryptjs.genSalt(10)
      const hash_pwd = await bcryptjs.hash(userData.password, salt)

      // Preparar datos del usuario
      const newUser = {
        id: uuidv4(),
        dni: parseInt(userData.dni),
        nickname,
        email: userData.email,
        cellphone: parseInt(userData.cellphone),
        it_level: 0, // Por defecto sin acceso, solo admin puede asignar nivel
        hash_pwd,
      }

      // Enviar a API
      await api.create('users', newUser)

      // Enviar notificación por email a los administradores
      await sendRegistrationNotification(newUser)

      // Guardar en sesión (sin la contraseña)
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

  // Iniciar sesión
  const login = async (email, password) => {
    try {
      if (!email || !password) {
        throw new Error('Email y contraseña requeridos')
      }

      // Obtener todos los usuarios
      const response = await api.getAll('users')
      const users = response.data

      // Buscar usuario por email
      const foundUser = users.find((u) => u.email === email)
      if (!foundUser) {
        throw new Error('Usuario no encontrado')
      }

      // Comparar contraseña con hash
      const isValidPassword = await bcryptjs.compare(password, foundUser.hash_pwd)
      if (!isValidPassword) {
        throw new Error('Contraseña incorrecta')
      }

      // Obtener datos adicionales de la tabla main (areas_ref, organizacion, etc.)
      const mainResponse = await api.getAll('main')
      const mainData = mainResponse.data
      const mainRecord = mainData.find((m) => m.DNI === foundUser.dni)

      // Si no existe registro en 'main', crear uno nuevo
      if (!mainRecord) {
        // Verificar si existe algún registro con el mismo email o celular
        const existingByEmailOrPhone = mainData.some(
          (m) =>
            m.email === foundUser.email ||
            (foundUser.cellphone && m.celular === foundUser.cellphone.toString()),
        )

        // Si no existe por dni, email o celular, crear nuevo registro en main
        if (!existingByEmailOrPhone) {
          const newMainRecord = {
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
          }
          await api.create('main', newMainRecord)
        }
      }

      // Guardar sesión (sin contraseña) + datos de main
      const userSession = { ...foundUser }
      delete userSession.hash_pwd

      // Obtener registro actualizado de main (por si se acaba de crear)
      const mainResponseUpdated = await api.getAll('main')
      const mainDataUpdated = mainResponseUpdated.data
      const mainRecordUpdated = mainDataUpdated.find((m) => m.DNI === foundUser.dni)

      // Agregar datos de main si existen
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

  // Cerrar sesión
  const logout = () => {
    user.value = null
    localStorage.removeItem('user')
  }

  // Verificar identidad del usuario para recuperar contraseña
  const verifyUserIdentity = async (data) => {
    try {
      const { dni, email } = data

      if (!dni || !email) {
        throw new Error('DNI y email requeridos')
      }

      // Obtener todos los usuarios
      const response = await api.getAll('users')
      const users = response.data

      // Buscar usuario por DNI y email
      const foundUser = users.find((u) => u.dni === parseInt(dni) && u.email === email)
      if (!foundUser) {
        throw new Error('Usuario no encontrado. Verifica que tu DNI y email sean correctos')
      }

      // Guardar datos temporalmente para el reset
      sessionStorage.setItem('resetUserData', JSON.stringify({ dni, email }))

      return { success: true, message: 'Identidad verificada' }
    } catch (error) {
      console.error('Error al verificar identidad:', error)
      throw error
    }
  }

  // Resetear contraseña del usuario
  const resetPassword = async (data) => {
    try {
      const { dni, email, newPassword } = data

      if (!dni || !email || !newPassword) {
        throw new Error('Todos los campos son requeridos')
      }

      // Obtener todos los usuarios
      const response = await api.getAll('users')
      const users = response.data

      // Buscar usuario por DNI y email
      const foundUser = users.find((u) => u.dni === parseInt(dni) && u.email === email)
      if (!foundUser) {
        throw new Error('Usuario no encontrado')
      }

      // Hash de la nueva contraseña
      const salt = await bcryptjs.genSalt(10)
      const hash_pwd = await bcryptjs.hash(newPassword, salt)

      // Actualizar la contraseña
      await api.update('users', {
        id: foundUser.id,
        hash_pwd,
      })

      // Limpiar datos temporales
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
    logout,
    verifyUserIdentity,
    resetPassword,
    loadUserFromStorage,
  }
})

// Exportar función para notificar cambio de nivel (no es parte del store)
export { sendAccessLevelNotification }
