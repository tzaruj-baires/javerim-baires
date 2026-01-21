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
