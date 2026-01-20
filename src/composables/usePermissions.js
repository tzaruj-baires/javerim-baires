import { useAuthStore } from '@/stores/auth'

/**
 * Composable para verificar permisos según el nivel IT del usuario
 * 
 * Uso:
 * const { can } = usePermissions()
 * can(1) → verdadero si nivel IT es 1 o mayor
 * can(3) → verdadero solo si nivel IT es 3
 */
export const usePermissions = () => {
  const authStore = useAuthStore()

  /**
   * Verifica si el usuario tiene permiso para un nivel específico o superior
   * @param {number} requiredLevel - Nivel requerido (1-3)
   * @returns {boolean} true si el usuario tiene permiso
   */
  const can = (requiredLevel) => {
    if (!authStore.user) return false
    
    const userLevel = authStore.user.it_level ?? 0
    return userLevel >= requiredLevel
  }

  /**
   * Verifica si el usuario tiene exactamente un nivel IT
   * @param {number} exactLevel - Nivel exacto
   * @returns {boolean} true si el usuario tiene ese nivel exacto
   */
  const canExact = (exactLevel) => {
    if (!authStore.user) return false
    return authStore.user.it_level === exactLevel
  }

  /**
   * Verifica si el usuario tiene cualquiera de los niveles especificados
   * @param {number[]} levels - Array de niveles permitidos
   * @returns {boolean} true si el usuario tiene alguno de los niveles
   */
  const canAny = (levels) => {
    if (!authStore.user) return false
    return levels.includes(authStore.user.it_level)
  }

  /**
   * Obtiene el nombre legible del nivel IT
   * @param {number} level - Nivel IT
   * @returns {string} Nombre del nivel
   */
  const getLevelName = (level) => {
    const names = {
      0: 'Sin acceso',
      1: 'Básico',
      2: 'Intermedio',
      3: 'Avanzado'
    }
    return names[level] || 'Desconocido'
  }

  return {
    can,
    canExact,
    canAny,
    getLevelName
  }
}
