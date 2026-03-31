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

  const normalizeCsv = (value) => {
    if (!value) return []
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim().toUpperCase()).filter(Boolean)
    }
    return String(value)
      .split(',')
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean)
  }

  const canAccessUserByMjlkt = (targetUserData) => {
    const mjlktRecords = Array.isArray(authStore.user?.mjlkt) ? authStore.user.mjlkt : []
    if (mjlktRecords.length === 0 || !targetUserData) return false

    const targetAreasRef = normalizeCsv(targetUserData.areas_ref)
    const targetAreas = normalizeCsv(targetUserData.areas)
    const targetOrg = String(targetUserData.organizacion || '')
      .trim()
      .toUpperCase()

    for (const record of mjlktRecords) {
      const recordOrg = String(record.org || '')
        .trim()
        .toUpperCase()
      if (!recordOrg || recordOrg !== targetOrg) continue

      const recordArea = String(record.area || '')
        .trim()
        .toUpperCase()
      const recordRol = String(record.rol || '')
        .trim()
        .toUpperCase()
      const recordSubrol = String(record.subrol || '')
        .trim()
        .toUpperCase()

      // Rol de área ROSh manda a acceso completo por organización
      if (recordArea === 'ROSH') return true

      // Subrol ROSH o SGAN: área completa dentro de su org
      if (['ROSH', 'SGAN'].includes(recordSubrol)) {
        if (targetAreasRef.includes(recordArea)) {
          return true
        }
      } else {
        // Subrol normal: org, area y rol estrictos
        if (targetAreasRef.includes(recordArea) && targetAreas.includes(recordRol)) {
          return true
        }
      }
    }

    return false
  }

  /**
   * Verifica si el usuario puede acceder al perfil de otro usuario
   * Usa tabla mjlkt para reglas de nivel 2 por subrol/rol/area
   * @param {number} targetDni - DNI del usuario objetivo
   * @param {object} targetUserData - Datos del usuario objetivo (areas_ref, areas, organizacion)
   * @returns {boolean} true si puede ver
   */
  const canAccessUser = (targetDni, targetUserData = null) => {
    if (!authStore.user) return false

    const userLevel = authStore.user.it_level ?? 0

    // Nivel 3: acceso total a todos los usuarios
    if (userLevel === 3) return true

    // Nivel 1: solo su propio perfil
    if (userLevel === 1) return authStore.user.dni === targetDni

    // Nivel 2: su propio perfil + reglas desde mjlkt
    if (userLevel === 2) {
      if (authStore.user.dni === targetDni) return true

      if (!targetUserData || !authStore.user.organizacion) return false

      const sameOrganization =
        String(authStore.user.organizacion || '')
          .trim()
          .toUpperCase() ===
        String(targetUserData.organizacion || '')
          .trim()
          .toUpperCase()
      if (!sameOrganization) return false

      // Solo autorizaciones definidas desde mjlkt; si no hay entry en mjlkt, no puede.
      return canAccessUserByMjlkt(targetUserData)
    }

    return false
  }

  /**
   * Verifica si el usuario puede VER a otro usuario en la tabla (visualización en Home)
   * Reglas por nivel de manera más granular con mjlkt
   * @param {object} targetUserData - Datos del usuario objetivo (areas_ref, areas, organizacion)
   * @returns {boolean} true si puede ver en tabla
   */
  const canSeeUserInTable = (targetUserData = null) => {
    if (!authStore.user || !targetUserData) return false

    const userLevel = authStore.user.it_level ?? 0

    // Nivel 0: no ve nada
    if (userLevel === 0) return false

    // Nivel 3: ve todos
    if (userLevel === 3) return true

    // Nivel 1: solo personas que comparten 'areas' (main)
    if (userLevel === 1) {
      const myAreas = normalizeCsv(authStore.user.areas)
      const targetAreas = normalizeCsv(targetUserData.areas)
      return myAreas.some((area) => targetAreas.includes(area))
    }

    // Nivel 2: dentro de misma organización + reglas mjlkt
    if (userLevel === 2) {
      const sameOrganization =
        String(authStore.user.organizacion || '')
          .trim()
          .toUpperCase() ===
        String(targetUserData.organizacion || '')
          .trim()
          .toUpperCase()
      if (!sameOrganization) return false

      const mjlktRecords = Array.isArray(authStore.user?.mjlkt) ? authStore.user.mjlkt : []

      // Sin estar en mjlkt: igual que nivel 1 (comparten 'areas' main)
      if (mjlktRecords.length === 0) {
        const myAreas = normalizeCsv(authStore.user.areas)
        const targetAreas = normalizeCsv(targetUserData.areas)
        return myAreas.some((area) => targetAreas.includes(area))
      }

      // Estando en mjlkt: aplicar reglas por subrol
      const targetAreasRef = normalizeCsv(targetUserData.areas_ref)
      const targetAreas = normalizeCsv(targetUserData.areas)
      const myAreas = normalizeCsv(authStore.user.areas)

      for (const record of mjlktRecords) {
        const recordArea = String(record.area || '')
          .trim()
          .toUpperCase()
        const recordSubrol = String(record.subrol || '')
          .trim()
          .toUpperCase()

        // Si area === "ROSH": ve todos en su org (ya verificado arriba)
        if (recordArea === 'ROSH') return true

        // Si subrol === "ROSH" o "SGAN": ve todos cuya areas_ref contenga el 'area' del record
        if (['ROSH', 'SGAN'].includes(recordSubrol)) {
          if (targetAreasRef.includes(recordArea)) return true
        } else {
          // Subrol normal/vacío: ve quienes comparten 'areas' + quienes estén en ese 'area' (areas_ref)
          // Primera condición: comparten 'areas'
          if (myAreas.some((area) => targetAreas.includes(area))) return true
          // Segunda condición: target tiene ese 'area' en areas_ref
          if (targetAreasRef.includes(recordArea)) return true
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
    canSeeUserInTable,
    getLevelName,
    shareAreas,
  }
}
