export const tiposSangre = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
]

export const nivelesHBTJ = ['B', 'A', 'MFKD0', 'MFKD1', 'MFKD2']

export const organizaciones = ['DAC', 'FJ', 'BH', 'LH', 'IONA']

export const Works = [
    'Tecnología',
    'Ingeniería',
    'Economía',
    'Ciencias',
    'Medicina/Veterinaria',
    'Derecho',
    'RRHH',
    'Filosofía y Letras',
    'Diseño/Arquitectura',
    'Educación física',
    'Educación',
    'Gastronomía',
    'Otro'
]
export const Estudies = [
    'Estudios secundarios',
    'Tecnología',
    'Ingeniería',
    'Economía',
    'Ciencias',
    'Medicina/Veterinaria',
    'Derecho',
    'RRHH',
    'Filosofía y Letras',
    'Diseño/Arquitectura',
    'Educación física',
    'Educación',
    'Gastronomía',
    'Otro'
]


/**
 * Convierte una fecha a formato dd/mm/yyyy
 * Maneja correctamente la zona horaria local evitando desajustes UTC
 * @param {string|Date} fecha - Fecha a convertir (ISO string o Date)
 * @returns {string} Fecha formateada como dd/mm/yyyy
 */
export const formatFecha = (fecha) => {
  if (!fecha) return ''

  let date

  // Si es string, parsearlo manualmente para evitar problemas de zona horaria
  if (typeof fecha === 'string') {
    // Formato esperado: YYYY-MM-DD o ISO completo
    const parts = fecha.split('T')[0].split('-')
    if (parts.length === 3) {
      const [year, month, day] = parts
      date = new Date(year, parseInt(month) - 1, parseInt(day))
    } else {
      date = new Date(fecha)
    }
  } else {
    date = new Date(fecha)
  }

  // Verificar que sea fecha válida
  if (isNaN(date.getTime())) return ''

  // Extraer día, mes, año usando métodos locales
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}


/**
 * Convierte una fecha a formato dd/mm/yyyy HH:mm
 * Maneja correctamente valores inválidos
 * @param {string|Date|null|undefined} fecha
 * @returns {string|null} fecha formateada como dd/mm/yyyy HH:mm o null si es inválida
 */
export function formatFechaEntera(fecha) {
  if (!fecha) return null; // "", null, undefined

  const d = new Date(fecha);

  // Validación CLAVE
  if (isNaN(d.getTime())) return null;

  const opciones = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };

  return new Intl.DateTimeFormat('es-ES', opciones)
    .format(d)
    .replace(',', '');
}





/**
 * Convierte una fecha en formato dd/mm/yyyy a ISO string YYYY-MM-DD
 * Usado para enviar fechas al backend
 * @param {string} fechaFormato - Fecha formateada como dd/mm/yyyy
 * @returns {string} Fecha en formato ISO YYYY-MM-DD
 */
export const parseFechaToISO = (fechaFormato) => {
  if (!fechaFormato) return ''

  // Si ya es ISO (contiene guiones en formato YYYY-MM-DD), retornar como está
  if (/^\d{4}-\d{2}-\d{2}/.test(fechaFormato)) {
    return fechaFormato.split('T')[0]
  }

  // Convertir dd/mm/yyyy a YYYY-MM-DD
  const parts = fechaFormato.split('/')
  if (parts.length === 3) {
    const [day, month, year] = parts
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  return fechaFormato
}

/**
 * Convierte dd/mm/yyyy [HH:mm] a ISO YYYY-MM-DD[THH:mm]
 * @param {string} fechaFormato - Ej: "25/12/2024 15:30"
 * @returns {string} - Ej: "2024-12-25T15:30"
 */
export const parseFechaEnteraToISO = (fechaFormato) => {
  if (!fechaFormato) return ''

  // 1. Si ya es ISO, extraemos hasta los minutos
  if (/^\d{4}-\d{2}-\d{2}/.test(fechaFormato)) {
    return fechaFormato.includes('T') 
      ? fechaFormato.substring(0, 16) 
      : fechaFormato
  }

  // 2. Separar fecha de hora
  const [datePart, timePart] = fechaFormato.trim().split(/\s+/)
  
  // 3. Procesar dd/mm/yyyy
  const parts = datePart.split('/')
  if (parts.length === 3) {
    const [day, month, year] = parts
    const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    // 4. Retornar con hora (HH:mm) si existe
    if (timePart && /^([01]\d|2[0-3]):([0-5]\d)/.test(timePart)) {
      return `${isoDate}T${timePart}`
    }
    
    return isoDate
  }

  return fechaFormato
}
