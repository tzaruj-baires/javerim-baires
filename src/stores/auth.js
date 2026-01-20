import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import bcryptjs from 'bcryptjs'
import * as api from '@/services/api'
import { v4 as uuidv4 } from 'uuid'

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

      // Guardar sesión (sin contraseña) + datos de main
      const userSession = { ...foundUser }
      delete userSession.hash_pwd

      // Agregar datos de main si existen
      if (mainRecord) {
        userSession.areas_ref = mainRecord.areas_ref || ''
        userSession.areas = mainRecord.areas || ''
        userSession.organizacion = mainRecord.organizacion || ''
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

  return {
    user,
    isAuthenticated,
    register,
    login,
    logout,
    loadUserFromStorage,
  }
})
