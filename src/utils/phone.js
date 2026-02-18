import parsePhoneNumber, { format, PhoneNumber } from 'libphonenumber-js'

export const COUNTRIES_CODES = [
  { name: 'Alemania', code: 'DE', dial_code: '49', emoji: '🇩🇪' },
  { name: 'Argentina', code: 'AR', dial_code: '54', emoji: '🇦🇷' },
  { name: 'Australia', code: 'AU', dial_code: '61', emoji: '🇦🇺' },
  { name: 'Austria', code: 'AT', dial_code: '43', emoji: '🇦🇹' },
  { name: 'Bélgica', code: 'BE', dial_code: '32', emoji: '🇧🇪' },
  { name: 'Bolivia', code: 'BO', dial_code: '591', emoji: '🇧🇴' },
  { name: 'Brasil', code: 'BR', dial_code: '55', emoji: '🇧🇷' },
  { name: 'Bulgaria', code: 'BG', dial_code: '359', emoji: '🇧🇬' },
  { name: 'Canadá', code: 'CA', dial_code: '1', emoji: '🇨🇦' },
  { name: 'Chile', code: 'CL', dial_code: '56', emoji: '🇨🇱' },
  { name: 'China', code: 'CN', dial_code: '86', emoji: '🇨🇳' },
  { name: 'Colombia', code: 'CO', dial_code: '57', emoji: '🇨🇴' },
  { name: 'Corea del Sur', code: 'KR', dial_code: '82', emoji: '🇰🇷' },
  { name: 'Costa Rica', code: 'CR', dial_code: '506', emoji: '🇨🇷' },
  { name: 'Croacia', code: 'HR', dial_code: '385', emoji: '🇭🇷' },
  { name: 'Cuba', code: 'CU', dial_code: '53', emoji: '🇨🇺' },
  { name: 'Dinamarca', code: 'DK', dial_code: '45', emoji: '🇩🇰' },
  { name: 'Ecuador', code: 'EC', dial_code: '593', emoji: '🇪🇨' },
  { name: 'Egipto', code: 'EG', dial_code: '20', emoji: '🇪🇬' },
  { name: 'El Salvador', code: 'SV', dial_code: '503', emoji: '🇸🇻' },
  { name: 'Emiratos Árabes Unidos', code: 'AE', dial_code: '971', emoji: '🇦🇪' },
  { name: 'Escocia', code: 'GB', dial_code: '44', emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { name: 'Eslovaquia', code: 'SK', dial_code: '421', emoji: '🇸🇰' },
  { name: 'Eslovenia', code: 'SI', dial_code: '386', emoji: '🇸🇮' },
  { name: 'España', code: 'ES', dial_code: '34', emoji: '🇪🇸' },
  { name: 'Estados Unidos', code: 'US', dial_code: '1', emoji: '🇺🇸' },
  { name: 'Estonia', code: 'EE', dial_code: '372', emoji: '🇪🇪' },
  { name: 'Filipinas', code: 'PH', dial_code: '63', emoji: '🇵🇭' },
  { name: 'Finlandia', code: 'FI', dial_code: '358', emoji: '🇫🇮' },
  { name: 'Francia', code: 'FR', dial_code: '33', emoji: '🇫🇷' },
  { name: 'Gales', code: 'GB', dial_code: '44', emoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { name: 'Grecia', code: 'GR', dial_code: '30', emoji: '🇬🇷' },
  { name: 'Groenlandia', code: 'GL', dial_code: '299', emoji: '🇬🇱' },
  { name: 'Guatemala', code: 'GT', dial_code: '502', emoji: '🇬🇹' },
  { name: 'Guyana', code: 'GY', dial_code: '592', emoji: '🇬🇾' },
  { name: 'Haití', code: 'HT', dial_code: '509', emoji: '🇭🇹' },
  { name: 'Honduras', code: 'HN', dial_code: '504', emoji: '🇭🇳' },
  { name: 'Hong Kong', code: 'HK', dial_code: '852', emoji: '🇭🇰' },
  { name: 'Hungría', code: 'HU', dial_code: '36', emoji: '🇭🇺' },
  { name: 'India', code: 'IN', dial_code: '91', emoji: '🇮🇳' },
  { name: 'Indonesia', code: 'ID', dial_code: '62', emoji: '🇮🇩' },
  { name: 'Irán', code: 'IR', dial_code: '98', emoji: '🇮🇷' },
  { name: 'Irlanda', code: 'IE', dial_code: '353', emoji: '🇮🇪' },
  { name: 'Islandia', code: 'IS', dial_code: '354', emoji: '🇮🇸' },
  { name: 'Islas Vírgenes Británicas', code: 'VG', dial_code: '1284', emoji: '🇻🇬' },
  { name: 'Israel', code: 'IL', dial_code: '972', emoji: '🇮🇱' },
  { name: 'Italia', code: 'IT', dial_code: '39', emoji: '🇮🇹' },
  { name: 'Jamaica', code: 'JM', dial_code: '1876', emoji: '🇯🇲' },
  { name: 'Japón', code: 'JP', dial_code: '81', emoji: '🇯🇵' },
  { name: 'Jorder', code: 'JO', dial_code: '962', emoji: '🇯🇴' },
  { name: 'Kazajistán', code: 'KZ', dial_code: '7', emoji: '🇰🇿' },
  { name: 'Kenia', code: 'KE', dial_code: '254', emoji: '🇰🇪' },
  { name: 'Kirguistán', code: 'KG', dial_code: '996', emoji: '🇰🇬' },
  { name: 'Letonia', code: 'LV', dial_code: '371', emoji: '🇱🇻' },
  { name: 'Líbano', code: 'LB', dial_code: '961', emoji: '🇱🇧' },
  { name: 'Liberia', code: 'LR', dial_code: '231', emoji: '🇱🇷' },
  { name: 'Liechtenstein', code: 'LI', dial_code: '423', emoji: '🇱🇮' },
  { name: 'Lituania', code: 'LT', dial_code: '370', emoji: '🇱🇹' },
  { name: 'Luxemburgo', code: 'LU', dial_code: '352', emoji: '🇱🇺' },
  { name: 'Macao', code: 'MO', dial_code: '853', emoji: '🇲🇴' },
  { name: 'Macedonia del Norte', code: 'MK', dial_code: '389', emoji: '🇲🇰' },
  { name: 'Madagascar', code: 'MG', dial_code: '261', emoji: '🇲🇬' },
  { name: 'Malasia', code: 'MY', dial_code: '60', emoji: '🇲🇾' },
  { name: 'Maldivas', code: 'MV', dial_code: '960', emoji: '🇲🇻' },
  { name: 'Mali', code: 'ML', dial_code: '223', emoji: '🇲🇱' },
  { name: 'Malta', code: 'MT', dial_code: '356', emoji: '🇲🇹' },
  { name: 'Marruecos', code: 'MA', dial_code: '212', emoji: '🇲🇦' },
  { name: 'Martinica', code: 'MQ', dial_code: '596', emoji: '🇲🇶' },
  { name: 'Mauricio', code: 'MU', dial_code: '230', emoji: '🇲🇺' },
  { name: 'Mauritania', code: 'MR', dial_code: '222', emoji: '🇲🇷' },
  { name: 'México', code: 'MX', dial_code: '52', emoji: '🇲🇽' },
  { name: 'Moldavia', code: 'MD', dial_code: '373', emoji: '🇲🇩' },
  { name: 'Mónaco', code: 'MC', dial_code: '377', emoji: '🇲🇨' },
  { name: 'Mongolia', code: 'MN', dial_code: '976', emoji: '🇲🇳' },
  { name: 'Montenegro', code: 'ME', dial_code: '382', emoji: '🇲🇪' },
  { name: 'Mozambique', code: 'MZ', dial_code: '258', emoji: '🇲🇿' },
  { name: 'Myanmar', code: 'MM', dial_code: '95', emoji: '🇲🇲' },
  { name: 'Namibia', code: 'NA', dial_code: '264', emoji: '🇳🇦' },
  { name: 'Nepal', code: 'NP', dial_code: '977', emoji: '🇳🇵' },
  { name: 'Nicaragua', code: 'NI', dial_code: '505', emoji: '🇳🇮' },
  { name: 'Níger', code: 'NE', dial_code: '227', emoji: '🇳🇪' },
  { name: 'Nigeria', code: 'NG', dial_code: '234', emoji: '🇳🇬' },
  { name: 'Noruega', code: 'NO', dial_code: '47', emoji: '🇳🇴' },
  { name: 'Nueva Zelanda', code: 'NZ', dial_code: '64', emoji: '🇳🇿' },
  { name: 'Países Bajos', code: 'NL', dial_code: '31', emoji: '🇳🇱' },
  { name: 'Pakistán', code: 'PK', dial_code: '92', emoji: '🇵🇰' },
  { name: 'Panamá', code: 'PA', dial_code: '507', emoji: '🇵🇦' },
  { name: 'Papúa Nueva Guinea', code: 'PG', dial_code: '675', emoji: '🇵🇬' },
  { name: 'Paraguay', code: 'PY', dial_code: '595', emoji: '🇵🇾' },
  { name: 'Perú', code: 'PE', dial_code: '51', emoji: '🇵🇪' },
  { name: 'Polonia', code: 'PL', dial_code: '48', emoji: '🇵🇱' },
  { name: 'Portugal', code: 'PT', dial_code: '351', emoji: '🇵🇹' },
  { name: 'Puerto Rico', code: 'PR', dial_code: '1787', emoji: '🇵🇷' },
  { name: 'Qatar', code: 'QA', dial_code: '974', emoji: '🇶🇦' },
  { name: 'Reino Unido', code: 'GB', dial_code: '44', emoji: '🇬🇧' },
  { name: 'República Checa', code: 'CZ', dial_code: '420', emoji: '🇨🇿' },
  { name: 'República Democrática del Congo', code: 'CD', dial_code: '243', emoji: '🇨🇩' },
  { name: 'República Dominicana', code: 'DO', dial_code: '1809', emoji: '🇩🇴' },
  { name: 'Reunión', code: 'RE', dial_code: '262', emoji: '🇷🇪' },
  { name: 'Rusia', code: 'RU', dial_code: '7', emoji: '🇷🇺' },
  { name: 'Rumania', code: 'RO', dial_code: '40', emoji: '🇷🇴' },
  { name: 'Rwanda', code: 'RW', dial_code: '250', emoji: '🇷🇼' },
  { name: 'Sagan Marino', code: 'SM', dial_code: '378', emoji: '🇸🇲' },
  { name: 'Samoa', code: 'WS', dial_code: '685', emoji: '🇼🇸' },
  { name: 'Samoa Americana', code: 'AS', dial_code: '1684', emoji: '🇦🇸' },
  { name: 'San Cristóbal y Nieves', code: 'KN', dial_code: '1869', emoji: '🇰🇳' },
  { name: 'San Marino', code: 'SM', dial_code: '378', emoji: '🇸🇲' },
  { name: 'San Vicente y las Granadinas', code: 'VC', dial_code: '1784', emoji: '🇻🇨' },
  { name: 'Santa Lucía', code: 'LC', dial_code: '1758', emoji: '🇱🇨' },
  { name: 'Santo Tomé y Príncipe', code: 'ST', dial_code: '239', emoji: '🇸🇹' },
  { name: 'Senegal', code: 'SN', dial_code: '221', emoji: '🇸🇳' },
  { name: 'Serbia', code: 'RS', dial_code: '381', emoji: '🇷🇸' },
  { name: 'Seychelles', code: 'SC', dial_code: '248', emoji: '🇸🇨' },
  { name: 'Sierra Leona', code: 'SL', dial_code: '232', emoji: '🇸🇱' },
  { name: 'Singapur', code: 'SG', dial_code: '65', emoji: '🇸🇬' },
  { name: 'Siria', code: 'SY', dial_code: '963', emoji: '🇸🇾' },
  { name: 'Somalia', code: 'SO', dial_code: '252', emoji: '🇸🇴' },
  { name: 'Sri Lanka', code: 'LK', dial_code: '94', emoji: '🇱🇰' },
  { name: 'Sudáfrica', code: 'ZA', dial_code: '27', emoji: '🇿🇦' },
  { name: 'Sudán', code: 'SD', dial_code: '249', emoji: '🇸🇩' },
  { name: 'Suecia', code: 'SE', dial_code: '46', emoji: '🇸🇪' },
  { name: 'Suiza', code: 'CH', dial_code: '41', emoji: '🇨🇭' },
  { name: 'Surinam', code: 'SR', dial_code: '597', emoji: '🇸🇷' },
  { name: 'Tailandia', code: 'TH', dial_code: '66', emoji: '🇹🇭' },
  { name: 'Taiwán', code: 'TW', dial_code: '886', emoji: '🇹🇼' },
  { name: 'Tanzania', code: 'TZ', dial_code: '255', emoji: '🇹🇿' },
  { name: 'Tayikistán', code: 'TJ', dial_code: '992', emoji: '🇹🇯' },
  { name: 'Territorio Británico del Océano Índico', code: 'IO', dial_code: '246', emoji: '🇮🇴' },
  { name: 'Territorios Palestinos', code: 'PS', dial_code: '970', emoji: '🇵🇸' },
  { name: 'Timor Oriental', code: 'TL', dial_code: '670', emoji: '🇹🇱' },
  { name: 'Togo', code: 'TG', dial_code: '228', emoji: '🇹🇬' },
  { name: 'Tonga', code: 'TO', dial_code: '676', emoji: '🇹🇴' },
  { name: 'Trinidad y Tobago', code: 'TT', dial_code: '1868', emoji: '🇹🇹' },
  { name: 'Túnez', code: 'TN', dial_code: '216', emoji: '🇹🇳' },
  { name: 'Turkmenistán', code: 'TM', dial_code: '993', emoji: '🇹🇲' },
  { name: 'Turquía', code: 'TR', dial_code: '90', emoji: '🇹🇷' },
  { name: 'Tuvalu', code: 'TV', dial_code: '688', emoji: '🇹🇻' },
  { name: 'Ucrania', code: 'UA', dial_code: '380', emoji: '🇺🇦' },
  { name: 'Uganda', code: 'UG', dial_code: '256', emoji: '🇺🇬' },
  { name: 'Uzbekistán', code: 'UZ', dial_code: '998', emoji: '🇺🇿' },
  { name: 'Uruguay', code: 'UY', dial_code: '598', emoji: '🇺🇾' },
  { name: 'Vanuatu', code: 'VU', dial_code: '678', emoji: '🇻🇺' },
  { name: 'Vaticano', code: 'VA', dial_code: '379', emoji: '🇻🇦' },
  { name: 'Venezuela', code: 'VE', dial_code: '58', emoji: '🇻🇪' },
  { name: 'Vietnam', code: 'VN', dial_code: '84', emoji: '🇻🇳' },
  { name: 'Yemen', code: 'YE', dial_code: '967', emoji: '🇾🇪' },
  { name: 'Yibuti', code: 'DJ', dial_code: '253', emoji: '🇩🇯' },
  { name: 'Zambia', code: 'ZM', dial_code: '260', emoji: '🇿🇲' },
  { name: 'Zimbabue', code: 'ZW', dial_code: '263', emoji: '🇿🇼' },
]

export function formatPhoneNumber(phoneNumber, countryCode) {
  if (!phoneNumber || typeof phoneNumber !== 'string' || !countryCode) return phoneNumber
  
  const trimmed = phoneNumber.trim()
  if (!trimmed) return ''
  
  try {
    const parsedNumber = parsePhoneNumber(trimmed, countryCode)
    if (parsedNumber && parsedNumber.isValid()) {
      // Retorna E.164 sin el "+"
      let num = parsedNumber.format('E.164').replace('+', '')
      console.log(num)
      return num
    }
  } catch (error) {
    console.error(`Error parsing phone number: ${error}`)
    return phoneNumber
  }
}

export function formatPhone(phone, format = 'NATIONAL') {
  if (!phone) return phone

  try {
    // 1. Limpio todo menos números y +
    let clean = phone.toString().replace(/[^\d+]/g, '')

    // 2. Normalizo casos argentinos raros
    // Si viene como 5411... → +5411...
    if (/^54\d+/.test(clean) && !clean.startsWith('+')) {
      clean = '+' + clean
    }

    // Si viene como 011... o 11... → lo dejo nacional
    if (/^(0?11)/.test(clean)) {
      clean = clean.replace(/^0/, '')
    }

    // 3. Parseo (AR por defecto)
    const parsed = clean.startsWith('+')
      ? parsePhoneNumber(clean)
      : parsePhoneNumber(clean, 'AR')

    if (!parsed?.isValid()) return phone

    // 4. Devuelvo según formato pedido
    switch (format) {
      case 'NATIONAL':
        return parsed.formatNational()       // 0 11 5802 1867

      case 'INTERNATIONAL':
        return parsed.formatInternational() // +54 11 5802 1867

      case 'E164':
        return parsed.format('E.164')       // +541158021867

      default:
        return parsed.format(format)
    }
  } catch {
    return phone
  }
}

/**
 * Extrae el código de país de un número en formato E.164 (sin +)
 * Ej: "5491123456789" => "AR"
 * Ej: "551145674890" => "BR"
 */
export function extractCountryCode(fullPhoneNumber) {
  if (!fullPhoneNumber || typeof fullPhoneNumber !== 'string') return ''

  try {
    // Agregamos "+" si no lo tiene para que parsePhoneNumber pueda parsearlo
    const phoneWithPlus = fullPhoneNumber.startsWith('+') ? fullPhoneNumber : '+' + fullPhoneNumber
    const parsedNumber = parsePhoneNumber(phoneWithPlus)
    
    if (parsedNumber && parsedNumber.country) {
      return parsedNumber.country
    }
  } catch (error) {
    console.error('Error parsing country from phone number:', error)
  }

  // Fallback: intentar encontrar qué país corresponde al número
  // Ordenar por dial_code descendente para que los más específicos se verifiquen primero
  const sortedCountries = [...COUNTRIES_CODES].sort((a, b) => b.dial_code.length - a.dial_code.length)
  for (const country of sortedCountries) {
    if (fullPhoneNumber.startsWith(country.dial_code)) {
      return country.code
    }
  }

  return ''
}

/**
 * Extrae solo el número local sin el código de país
 * Ej: "5491123456789" => "91123456789"
 * Ej: "541155554444" => "1155554444"
 * Ej: "551145674890" => "1145674890"
 */
export function extractLocalNumber(fullPhoneNumber) {
  if (!fullPhoneNumber) {
    console.warn('extractLocalNumber recibió null/undefined:', fullPhoneNumber)
    return fullPhoneNumber
  }

  try {
    // Convertir a string PRIMERO, independientemente del tipo
    let phoneStr = String(fullPhoneNumber).trim()
    
    if (!phoneStr) return fullPhoneNumber

    // Remover espacios, guiones, paréntesis
    phoneStr = phoneStr.replace(/[\s\-\(\)]/g, '')

    // Si tiene "+", removerlo
    if (phoneStr.startsWith('+')) {
      phoneStr = phoneStr.substring(1)
    }

    // Encontrar el código de país más largo primero
    // Crear array de códigos únicos ordenados por longitud descendente
    const sortedCodes = COUNTRIES_CODES
      .map(c => c.dial_code)
      .sort((a, b) => b.length - a.length)
      .filter((code, index, self) => self.indexOf(code) === index) // Remover duplicados

    for (const code of sortedCodes) {
      if (phoneStr.startsWith(code)) {
        const localNumber = phoneStr.substring(code.length)
        return localNumber || phoneStr
      }
    }

    // Si no encontramos un código válido
    console.warn('No se encontró código de país para:', phoneStr)
    return phoneStr
  } catch (error) {
    console.error('Error extracting local number:', error)
    return fullPhoneNumber
  }
}
