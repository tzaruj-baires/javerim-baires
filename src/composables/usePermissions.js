import { useAuthStore } from '@/stores/auth'

/**
 * Composable para verificar permisos según el nivel IT del usuario
 *
 * Niveles:
 * 1: Básico - solo ve su propio perfil, edita: personal, contacto, domicilio, médicos, desarrollo, familia (NO técnico, NO organización)
 * 2: Intermedio - ve usuarios de sus áreas, edita: personal, contacto, domicilio, médicos, desarrollo, familia, organización (NO técnico)
 * 3: Avanzado - acceso total, incluyendo datos técnicos
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
      3: 'Avanzado',
    }
    return names[level] || 'Desconocido'
  }

  /**
   * Verifica si el usuario puede editar un acordeón específico
   * @param {string} section - Nombre de la sección (personal, contacto, domicilio, medicos, organizacion, desarrollo, familia, tecnicos)
   * @returns {boolean} true si puede editar
   */
  const canEditSection = (section) => {
    if (!authStore.user) return false

    const userLevel = authStore.user.it_level ?? 0

    // Nivel 3: puede editar TODO incluyendo técnico
    if (userLevel === 3) return true

    // Nivel 1: puede editar personal, contacto, domicilio, medicos, desarrollo, familia
    // NO puede editar: técnico, organización
    if (userLevel === 1) {
      const editableSections = [
        'personal',
        'contacto',
        'domicilio',
        'medicos',
        'desarrollo',
        'familia',
      ]
      return editableSections.includes(section)
    }

    // Nivel 2: puede editar personal, contacto, domicilio, medicos, desarrollo, familia, organización
    // NO puede editar: técnico
    if (userLevel === 2) {
      const editableSections = [
        'personal',
        'contacto',
        'domicilio',
        'medicos',
        'desarrollo',
        'familia',
        'organizacion',
      ]
      return editableSections.includes(section)
    }

    return false
  }

  /**
   * Verifica si el usuario puede ver la sección técnicos
   * @returns {boolean} true si es nivel 3
   */
  const canSeeTechnical = () => {
    if (!authStore.user) return false
    return authStore.user.it_level === 3
  }

  /**
   * Comprueba si dos strings de áreas comparten al menos una área común
   * Las áreas están separadas por comas (ej: "ÁREA1, ÁREA2, ÁREA3")
   * @param {string} areas1 - Áreas del usuario 1
   * @param {string} areas2 - Áreas del usuario 2
   * @returns {boolean} true si comparten al menos una área
   */
  const shareAreas = (areas1, areas2) => {
    if (!areas1 || !areas2) return false

    // Dividir por comas y trimear espacios
    const areasArray1 = areas1.split(',').map((a) => a.trim())
    const areasArray2 = areas2.split(',').map((a) => a.trim())

    // Verificar si hay intersección
    return areasArray1.some((area) => areasArray2.includes(area))
  }

  /**
   * Verifica si el usuario puede acceder al perfil de otro usuario
   * Usa areas_ref (áreas puras) para la comparación, no areas (áreas+roles)
   * CASO ESPECIAL: Usuarios con "ROSH" en areas_ref pueden ver TODOS de su organización
   * @param {number} targetDni - DNI del usuario objetivo
   * @param {object} targetUserData - Datos del usuario objetivo (areas_ref, organizacion)
   * @returns {boolean} true si puede ver
   */
  const canAccessUser = (targetDni, targetUserData = null) => {
    if (!authStore.user) return false

    const userLevel = authStore.user.it_level ?? 0

    // Nivel 3: acceso total a todos los usuarios
    if (userLevel === 3) return true

    // Nivel 1: solo su propio perfil
    if (userLevel === 1) return authStore.user.dni === targetDni

    // Nivel 2: su propio perfil + usuarios que compartan MISMA organización
    if (userLevel === 2) {
      if (authStore.user.dni === targetDni) return true

      if (targetUserData && authStore.user.organizacion) {
        // Verificar que sean de la misma organización
        const sameOrganization = authStore.user.organizacion === targetUserData.organizacion
        if (!sameOrganization) return false

        // CASO ESPECIAL: Si el usuario tiene "ROSH" en areas_ref, puede ver a TODOS de su organización
        if (authStore.user.areas_ref && authStore.user.areas_ref.includes('ROSH')) {
          return true
        }

        // CASO NORMAL: Verificar que compartan al menos una área
        if (authStore.user.areas_ref && targetUserData.areas_ref) {
          return shareAreas(authStore.user.areas_ref, targetUserData.areas_ref)
        }
      }
    }

    return false
  }

  return {
    can,
    canExact,
    canAny,
    canEditSection,
    canSeeTechnical,
    canAccessUser,
    getLevelName,
    shareAreas,
  }
}
