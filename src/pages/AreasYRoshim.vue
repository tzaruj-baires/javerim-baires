<template>
  <div class="container-fluid mt-4">
    <!-- Bienvenida -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm bg-gradient-warning text-dark">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h2 class="mb-0"><i class="bi bi-stack"></i> Áreas y Roshim</h2>
            </div>
            <div>
              <button @click="refreshData" class="btn btn-warning me-2" :disabled="loading">
                <i class="bi bi-arrow-clockwise"></i> Actualizar
              </button>
              <button @click="openCreateModal" class="btn btn-success" v-if="canEdit">
                <i class="bi bi-plus-circle"></i> Nuevo Registro
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alertas -->
    <div v-if="successMessage" class="row mb-3">
      <div class="col-12">
        <div class="alert alert-success alert-dismissible fade show" role="alert">
          {{ successMessage }}
          <button type="button" class="btn-close" @click="successMessage = ''"></button>
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="row mb-3">
      <div class="col-12">
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          {{ errorMessage }}
          <button type="button" class="btn-close" @click="errorMessage = ''"></button>
        </div>
      </div>
    </div>

    <!-- Tabla de registros -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-2"><i class="bi bi-table"></i> Registros MJLKT</h5>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control form-control-sm"
              placeholder="Buscar por DNI, nombre, apellido, apodo, email..."
            />
          </div>

          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover table-striped align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th @click="sortBy('org')" class="cursor-pointer">
                      Org {{ getSortIndicator('org') }}
                    </th>
                    <th @click="sortBy('area')" class="cursor-pointer">
                      Área {{ getSortIndicator('area') }}
                    </th>
                    <th @click="sortBy('rol')" class="cursor-pointer">
                      Rol {{ getSortIndicator('rol') }}
                    </th>
                    <th @click="sortBy('dni')" class="cursor-pointer">
                      DNI {{ getSortIndicator('dni') }}
                    </th>
                    <th @click="sortBy('nombre')" class="cursor-pointer">
                      Nombre {{ getSortIndicator('nombre') }}
                    </th>
                    <th @click="sortBy('apellido')" class="cursor-pointer">
                      Apellido {{ getSortIndicator('apellido') }}
                    </th>
                    <th @click="sortBy('apodo')" class="cursor-pointer">
                      Apodo {{ getSortIndicator('apodo') }}
                    </th>
                    <th @click="sortBy('celular')" class="cursor-pointer">
                      Celular {{ getSortIndicator('celular') }}
                    </th>
                    <th @click="sortBy('email')" class="cursor-pointer">
                      Email {{ getSortIndicator('email') }}
                    </th>
                    <th class="text-center" v-if="canEdit">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-if="loading">
                    <td :colspan="canEdit ? 10 : 9" class="text-center py-4">
                      <span class="spinner-border spinner-border-sm me-2"></span> Cargando...
                    </td>
                  </tr>

                  <tr v-else-if="filteredRecords.length === 0">
                    <td :colspan="canEdit ? 10 : 9" class="text-center py-4 text-muted">
                      No hay registros
                    </td>
                  </tr>

                  <tr v-else v-for="record in paginatedRecords" :key="record.id">
                    <td>{{ record.org }}</td>
                    <td>{{ record.area }}</td>
                    <td>{{ record.rol }}</td>
                    <td>
                      <strong>{{ record.dni }}</strong>
                    </td>
                    <td>{{ record.nombre }}</td>
                    <td>{{ record.apellido }}</td>
                    <td>{{ record.apodo }}</td>
                    <td>
                      <a :href="`https://wa.me/${record.celular}`" v-if="record.celular">
                        {{ record.celular }}
                      </a>
                      <span v-else>-</span>
                    </td>
                    <td>
                      <small>{{ record.email }}</small>
                    </td>
                    <td class="text-center" v-if="canEdit">
                      <div class="btn-group btn-group-sm" role="group">
                        <button
                          @click="openEditModal(record)"
                          class="btn btn-outline-primary"
                          title="Editar"
                          :disabled="!canEditRecord(record)"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button
                          @click="deleteRecord(record.id)"
                          class="btn btn-outline-danger"
                          title="Eliminar"
                          :disabled="!canEditRecord(record)"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Paginación -->
          <div class="card-footer bg-light d-flex justify-content-between align-items-center">
            <small class="text-muted">
              Mostrando {{ paginatedRecords.length }} de {{ filteredRecords.length }} registros
            </small>
            <div>
              <button
                v-if="displayedCount < filteredRecords.length"
                @click="loadMore"
                class="btn btn-sm btn-outline-primary me-2"
              >
                <i class="bi bi-chevron-down"></i> Más
              </button>
              <button
                v-if="displayedCount > itemsPerPage"
                @click="showLess"
                class="btn btn-sm btn-outline-secondary"
              >
                <i class="bi bi-chevron-up"></i> Menos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar -->
    <div v-if="showModal" class="modal d-block" style="background-color: rgba(0, 0, 0, 0.5)">
      <div class="modal-dialog" :class="{ 'modal-lg': isEditing || dniFound }">
        <div class="modal-content modal-dialog-centered">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Editar Registro' : 'Nuevo Registro' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <!-- Búsqueda de DNI -->
            <div v-if="!isEditing && !dniFound" class="mb-4">
              <label for="dniSearch" class="form-label fw-bold">Ingresa el DNI</label>
              <input
                v-model="form.dni"
                type="text"
                id="dniSearch"
                class="form-control form-control-lg"
                placeholder="Ej: 12345678"
                @input="onDniChange"
                autofocus
              />
              <small class="text-muted">El DNI debe estar registrado en áreas y roshim</small>
              <div v-if="dniError" class="alert alert-danger mt-3 mb-0">
                <i class="bi bi-exclamation-circle"></i> {{ dniError }}
              </div>
            </div>

            <!-- Formulario completo (cuando DNI existe o está editando) -->
            <form @submit.prevent="saveRecord" v-if="isEditing || dniFound">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="org" class="form-label">Org</label>
                  <input
                    v-model="form.org"
                    type="text"
                    id="org"
                    class="form-control"
                    required
                    :disabled="!canEditOrg || !isEditing"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label for="area" class="form-label">Área</label>
                  <input
                    v-model="form.area"
                    type="text"
                    id="area"
                    class="form-control"
                    required
                    :disabled="!isEditing"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label for="rol" class="form-label">Rol</label>
                  <input
                    v-model="form.rol"
                    type="text"
                    id="rol"
                    class="form-control"
                    required
                    :disabled="!isEditing"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label for="dni" class="form-label">DNI</label>
                  <input
                    v-model="form.dni"
                    type="text"
                    id="dni"
                    class="form-control"
                    required
                    disabled
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label for="nombre" class="form-label">Nombre</label>
                  <input
                    v-model="form.nombre"
                    type="text"
                    id="nombre"
                    class="form-control"
                    required
                    :disabled="!isEditing"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label for="apellido" class="form-label">Apellido</label>
                  <input
                    v-model="form.apellido"
                    type="text"
                    id="apellido"
                    class="form-control"
                    required
                    :disabled="!isEditing"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label for="apodo" class="form-label">Apodo</label>
                  <input
                    v-model="form.apodo"
                    type="text"
                    id="apodo"
                    class="form-control"
                    :disabled="!isEditing"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label for="celular" class="form-label">Celular</label>
                  <input
                    v-model="form.celular"
                    type="text"
                    id="celular"
                    class="form-control"
                    :disabled="!isEditing"
                  />
                </div>
                <div class="col-md-12 mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    v-model="form.email"
                    type="email"
                    id="email"
                    class="form-control"
                    :disabled="!isEditing"
                  />
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
            <button
              v-if="isEditing || dniFound"
              type="button"
              class="btn btn-primary"
              @click="saveRecord"
              :disabled="saving"
            >
              <span v-if="!saving">{{ isEditing ? 'Actualizar' : 'Guardar' }}</span>
              <span v-else>
                <span
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Guardando...
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAll, create, update, remove, sendEmail } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const records = ref([])
const mainUsers = ref([])
const loading = ref(true)
const searchQuery = ref('')
const displayedCount = ref(10)
const itemsPerPage = 10
const sortKey = ref('')
const sortOrder = ref('asc')
const successMessage = ref('')
const errorMessage = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const selectedRecord = ref(null)
const saving = ref(false)
const dniFound = ref(false)
const dniError = ref('')

const form = ref({
  org: '',
  area: '',
  rol: '',
  dni: '',
  nombre: '',
  apellido: '',
  apodo: '',
  celular: '',
  email: '',
})

// Permisos
const canEdit = computed(() => {
  return (
    authStore.user?.it_level === 3 ||
    (authStore.user?.it_level === 2 && authStore.user?.area === 'ROSH')
  )
})

const canEditOrg = computed(() => {
  return authStore.user?.it_level === 3
})

const canEditRecord = (record) => {
  if (authStore.user?.it_level === 3) return true
  if (authStore.user?.it_level === 2 && authStore.user?.area === 'ROSH') {
    return record.org === authStore.user?.organizacion
  }
  return false
}

const filteredRecords = computed(() => {
  let filtered = records.value

  // Filtrar por permisos
  if (authStore.user?.it_level === 2 && authStore.user?.area === 'ROSH') {
    filtered = filtered.filter((record) => record.org === authStore.user?.organizacion)
  }

  if (!searchQuery.value.trim()) {
    return filtered
  }

  const query = normalizeText(searchQuery.value)

  return filtered.filter((record) => {
    return (
      normalizeText(record.dni).includes(query) ||
      normalizeText(record.nombre).includes(query) ||
      normalizeText(record.apellido).includes(query) ||
      normalizeText(record.apodo).includes(query) ||
      normalizeText(record.email).includes(query)
    )
  })
})

const sortedAndPaginated = computed(() => {
  let sorted = [...filteredRecords.value]

  if (sortKey.value) {
    sorted.sort((a, b) => {
      let aVal = a[sortKey.value]
      let bVal = b[sortKey.value]

      if (!isNaN(aVal)) aVal = Number(aVal)
      if (!isNaN(bVal)) bVal = Number(bVal)

      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()

      if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return sorted.slice(0, displayedCount.value)
})

const paginatedRecords = sortedAndPaginated

const normalizeText = (text = '') =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const getSortIndicator = (key) => {
  if (sortKey.value !== key) return ''
  return sortOrder.value === 'asc' ? '▲' : '▼'
}

const loadMore = () => {
  displayedCount.value += itemsPerPage
}

const showLess = () => {
  displayedCount.value = itemsPerPage
}

const loadData = async () => {
  loading.value = true
  try {
    const [mjlktRes, mainRes] = await Promise.all([getAll('mjlkt'), getAll('main')])
    records.value = mjlktRes.data || []
    mainUsers.value = mainRes.data || []
  } catch (err) {
    console.error('Error cargando datos', err)
    errorMessage.value = 'Error al cargar los datos'
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadData()
}

const onDniChange = () => {
  dniError.value = ''
  dniFound.value = false

  if (!form.value.dni.trim()) return

  // Si estamos editando, no validar
  if (isEditing.value) return

  // Buscar el DNI en mjlkt para crear nuevo registro
  const existingRecord = records.value.find((r) => r.dni === form.value.dni)
  if (existingRecord) {
    // Cargar datos del registro encontrado en mjlkt
    form.value.org = existingRecord.org
    form.value.area = existingRecord.area
    form.value.rol = existingRecord.rol
    form.value.nombre = existingRecord.nombre || ''
    form.value.apellido = existingRecord.apellido || ''
    form.value.apodo = existingRecord.apodo || ''
    form.value.celular = existingRecord.celular || ''
    form.value.email = existingRecord.email || ''
    dniFound.value = true
  } else {
    // DNI no encontrado en mjlkt
    dniError.value =
      'El DNI no está registrado en áreas y roshim. Debe pertenecer al área para poder asignarle la roshatura.'
  }
}

const openCreateModal = () => {
  isEditing.value = false
  selectedRecord.value = null
  dniFound.value = false
  dniError.value = ''
  form.value = {
    org: canEditOrg.value ? '' : authStore.user?.organizacion || '',
    area: '',
    rol: '',
    dni: '',
    nombre: '',
    apellido: '',
    apodo: '',
    celular: '',
    email: '',
  }
  showModal.value = true
}

const openEditModal = (record) => {
  if (!canEditRecord(record)) return
  isEditing.value = true
  selectedRecord.value = record
  form.value = { ...record }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  dniFound.value = false
  dniError.value = ''
  form.value = {
    org: '',
    area: '',
    rol: '',
    dni: '',
    nombre: '',
    apellido: '',
    apodo: '',
    celular: '',
    email: '',
  }
}

const saveRecord = async () => {
  try {
    saving.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const data = { ...form.value }

    if (isEditing.value) {
      data.id = selectedRecord.value.id
      await update('mjlkt', data)
      const index = records.value.findIndex((r) => r.id === selectedRecord.value.id)
      if (index !== -1) {
        records.value[index] = { ...records.value[index], ...data }
      }
      successMessage.value = 'Registro actualizado correctamente'
    } else {
      await create('mjlkt', data)
      records.value.push(data)

      successMessage.value = 'Registro creado correctamente'
    }

    closeModal()
    setTimeout(() => {
      successMessage.value = ''
    }, 2000)
  } catch (err) {
    console.error('Error guardando registro:', err)
    errorMessage.value = 'Error al guardar el registro'
  } finally {
    saving.value = false
  }
}

const deleteRecord = async (recordId) => {
  if (!confirm('¿Estás seguro de que quieres eliminar este registro?')) {
    return
  }

  try {
    errorMessage.value = ''
    successMessage.value = ''
    await remove('mjlkt', recordId)

    records.value = records.value.filter((r) => r.id !== recordId)
    successMessage.value = 'Registro eliminado correctamente'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err) {
    console.error('Error eliminando registro:', err)
    errorMessage.value = 'Error al eliminar el registro'
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
