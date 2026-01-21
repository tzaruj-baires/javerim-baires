import parsePhoneNumber from 'libphonenumber-js'

export const COUNTRIES_CODES = [
  { name: 'Alemania', code: 'DE', dial_code: '49', emoji: '🇩🇪' },
  { name: 'Argentina', code: 'AR', dial_code: '54', emoji: '🇦🇷' },
  { name: 'Bolivia', code: 'BO', dial_code: '591', emoji: '🇧🇴' },
  { name: 'Brasil', code: 'BR', dial_code: '55', emoji: '🇧🇷' },
  { name: 'Canadá', code: 'CA', dial_code: '1', emoji: '🇨🇦' },
  { name: 'Chile', code: 'CL', dial_code: '56', emoji: '🇨🇱' },
  { name: 'Colombia', code: 'CO', dial_code: '57', emoji: '🇨🇴' },
  { name: 'Ecuador', code: 'EC', dial_code: '593', emoji: '🇪🇨' },
  { name: 'España', code: 'ES', dial_code: '34', emoji: '🇪🇸' },
  { name: 'Estados Unidos', code: 'US', dial_code: '1', emoji: '🇺🇸' },
  { name: 'Francia', code: 'FR', dial_code: '33', emoji: '🇫🇷' },
  { name: 'Israel', code: 'IL', dial_code: '972', emoji: '🇮🇱' },
  { name: 'Italia', code: 'IT', dial_code: '39', emoji: '🇮🇹' },
  { name: 'México', code: 'MX', dial_code: '52', emoji: '🇲🇽' },
  { name: 'Países Bajos', code: 'NL', dial_code: '31', emoji: '🇳🇱' },
  { name: 'Paraguay', code: 'PY', dial_code: '595', emoji: '🇵🇾' },
  { name: 'Perú', code: 'PE', dial_code: '51', emoji: '🇵🇪' },
  { name: 'Reino Unido', code: 'GB', dial_code: '44', emoji: '🇬🇧' },
  { name: 'Uruguay', code: 'UY', dial_code: '598', emoji: '🇺🇾' },
  { name: 'Venezuela', code: 'VE', dial_code: '58', emoji: '🇻🇪' },
]

export function formatPhoneNumber(phoneNumber, countryCode) {
  if (!countryCode) return phoneNumber
  try {
    const parsedNumber = parsePhoneNumber(phoneNumber, countryCode)
    if (parsedNumber && parsedNumber.isValid()) {
      let num = parsedNumber.format('E.164').replace('+', '')
      console.log(num)
      return num
    }
  } catch (error) {
    return phoneNumber
  }
}

/**
 * Extrae el código de país de un número en formato E.164 (sin +)
 * Ej: "5491123456789" => "54"
 * Ej: "551145674890" => "55"
 */
export function extractCountryCode(fullPhoneNumber) {
  if (!fullPhoneNumber) return ''

  // Intentar encontrar qué país corresponde al número
  for (const country of COUNTRIES_CODES) {
    if (fullPhoneNumber.startsWith(country.dial_code)) {
      return country.code
    }
  }

  return ''
}

/**
 * Extrae solo el número local sin el código de país
 * Ej: "5491123456789" con country "AR" (dial_code 54) => "91123456789"
 * Ej: "551145674890" con country "BR" (dial_code 55) => "1145674890"
 */
export function extractLocalNumber(fullPhoneNumber, countryCode) {
  if (!fullPhoneNumber || !countryCode) return fullPhoneNumber

  const country = COUNTRIES_CODES.find((c) => c.code === countryCode)
  if (!country) return fullPhoneNumber

  const dialCode = country.dial_code
  if (fullPhoneNumber.startsWith(dialCode)) {
    return fullPhoneNumber.slice(dialCode.length)
  }

  return fullPhoneNumber
}
