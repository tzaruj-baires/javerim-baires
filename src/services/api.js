import axios from 'axios'

const API_URL = import.meta.env.VITE_GOOGLE_API

const params = (resource, action, data = {}) => new URLSearchParams({ resource, action, ...data })

export const getAll = (resource) => axios.get(API_URL, { params: { resource } })

export const create = (resource, data) => axios.post(API_URL, params(resource, 'create', data))

export const update = (resource, data) => {
  const formData = new URLSearchParams()
  formData.append('resource', resource)
  formData.append('action', 'update')

  // Agregar cada propiedad de data explícitamente
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      formData.append(key, data[key])
    }
  }

  console.log('API Update Request:', { resource, action: 'update', ...data })
  return axios.post(API_URL, formData)
}

export const remove = (resource, id) => axios.post(API_URL, params(resource, 'delete', { id }))

export const sendEmail = (template, to, subject, data = {}) => {
  const formData = new URLSearchParams()
  formData.append('resource', 'email') // resource puede ser cualquier valor válido
  formData.append('action', 'sendEmail')
  formData.append('template', template)
  formData.append('to', to)
  formData.append('subject', subject)

  for (const key in data) {
    if (Object.hasOwn(data, key)) {
      formData.append(key, data[key])
    }
  }

  console.log('API Send Email Request:', { template, to, subject, ...data })

  return axios.post(API_URL, formData)
}

/**
 * @param {File}   file       - objeto File del input
 * @param {string} folderKey  - key de FOLDERS: 'dni', 'rostro', 'img_gral', etc.
 * @param {object} opts
 * @param {number} opts.dniUser   - dni del usuario al que pertenece el archivo
 * @param {number} opts.dniStamp  - dni del usuario que está subiendo (opcional, default = dniUser)
 */
export const uploadFile = (file, folderKey, { dniUser, dniStamp } = {}) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async () => {
      const base64 = reader.result.split(',')[1]

      const payload = {
        resource: 'drive',
        action: 'uploadFile',
        folder: folderKey,
        fileName: file.name,
        mimeType: file.type,
        fileData: base64,
        ...(dniUser && { dniUser }),
        ...(dniStamp && { dniStamp }),
      }

      try {
        const response = await axios.post(API_URL, JSON.stringify(payload), {
          // ✅ text/plain no dispara preflight OPTIONS
          headers: { 'Content-Type': 'text/plain' },
        })
        console.log('Raw axios response:', response.data)
        resolve(response.data)
      } catch (err) {
        reject(err)
      }
    }

    reader.onerror = () => reject(new Error('Error leyendo el archivo'))
    reader.readAsDataURL(file)
  })
}
