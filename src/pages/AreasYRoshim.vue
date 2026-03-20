<template>
  <div class="container-fluid mt-4">
    <!-- Acceso denegado para nivel 1 o inferior -->
    <div v-if="authStore.user?.it_level <= 1" class="row justify-content-center mt-5">
      <div class="col-md-6">
        <div class="card shadow-sm border-danger">
          <div class="card-body text-center py-5">
            <i class="bi bi-shield-lock text-danger" style="font-size: 3rem"></i>
            <h4 class="mt-3 text-danger">Acceso denegado</h4>
            <p class="text-muted">No tenés permisos para ver esta página.</p>
          </div>
        </div>
      </div>
    </div>

    <template v-else>
      <!-- Bienvenida -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card shadow-sm bg-gradient-warning text-dark">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div>
                <h2 class="mb-0"><i class="bi bi-stack"></i> Áreas y Roshim</h2>
              </div>
              <div>
                <button @click="openCreateModal" class="btn btn-success" v-if="canEdit">
                  <i class="bi bi-plus-circle"></i> Agregar
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
                placeholder="Buscar por org, área, rol, subrol, DNI, nombre, apellido, apodo, email..."
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
                      <th @click="sortBy('subrol')" class="cursor-pointer">
                        Subrol {{ getSortIndicator('subrol') }}
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
                      <td :colspan="canEdit ? 11 : 10" class="text-center py-4">
                        <span class="spinner-border spinner-border-sm me-2"></span> Cargando...
                      </td>
                    </tr>

                    <tr v-else-if="filteredRecords.length === 0">
                      <td :colspan="canEdit ? 11 : 10" class="text-center py-4 text-muted">
                        No hay registros
                      </td>
                    </tr>

                    <tr v-else v-for="record in paginatedRecords" :key="record.id">
                      <td>{{ record.org }}</td>
                      <td>{{ record.area }}</td>
                      <td>{{ record.rol }}</td>
                      <td>{{ record.subrol }}</td>
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
                          <template v-if="canEditRecord(record)">
                            <button
                              @click="openEditModal(record)"
                              class="btn btn-outline-primary"
                              title="Editar"
                            >
                              <i class="bi bi-pencil"></i>
                            </button>
                            <button
                              @click="deleteRecord(record.id)"
                              class="btn btn-outline-danger"
                              title="Eliminar"
                            >
                              <i class="bi bi-trash"></i>
                            </button>
                          </template>
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
        <div class="modal-dialog modal-lg">
          <div class="modal-content modal-dialog-centered">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEditing ? 'Editar Registro' : 'Nuevo Registro' }}</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveRecord">
                <div class="row">
                  <!-- Campos editables: org, area, rol -->
                  <div class="col-md-6 mb-3">
                    <label for="org" class="form-label">Org</label>
                    <input
                      v-model="form.org"
                      type="text"
                      id="org"
                      class="form-control"
                      required
                      :disabled="!canEditOrg"
                      list="list-org"
                    />
                    <datalist id="list-org">
                      <option v-for="opt in orgOptions" :key="opt" :value="opt" />
                    </datalist>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="area" class="form-label">Área</label>
                    <input
                      v-model="form.area"
                      type="text"
                      id="area"
                      class="form-control"
                      required
                      list="list-area"
                      @input="form.dni ? onDniEditChange() : null"
                    />
                    <datalist id="list-area">
                      <option v-for="opt in areaOptions" :key="opt" :value="opt" />
                    </datalist>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="rol" class="form-label">Rol</label>
                    <input
                      v-model="form.rol"
                      type="text"
                      id="rol"
                      class="form-control"
                      required
                      list="list-rol"
                    />
                    <datalist id="list-rol">
                      <option v-for="opt in rolOptions" :key="opt" :value="opt" />
                    </datalist>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="subrol" class="form-label">Subrol</label>
                    <input
                      v-model="form.subrol"
                      type="text"
                      id="subrol"
                      class="form-control"
                      list="list-subrol"
                    />
                    <datalist id="list-subrol">
                      <option v-for="opt in subrolOptions" :key="opt" :value="opt" />
                    </datalist>
                  </div>
                  <!-- DNI: editable, carga datos de main al cambiar -->
                  <div class="col-md-6 mb-3">
                    <label for="dni" class="form-label">DNI</label>
                    <input
                      v-model="form.dni"
                      type="text"
                      id="dni"
                      class="form-control"
                      required
                      @input="onDniEditChange"
                    />
                    <small class="text-muted">Al ingresar el DNI se cargan los datos</small>
                    <div v-if="dniEditError" class="text-danger small mt-1">
                      <i class="bi bi-exclamation-circle"></i> {{ dniEditError }}
                    </div>
                  </div>
                  <!-- Campos de solo lectura (se cargan desde main) -->
                  <div class="col-md-6 mb-3">
                    <label for="nombre" class="form-label">Nombre </label>
                    <input
                      v-model="form.nombre"
                      type="text"
                      id="nombre"
                      class="form-control bg-light"
                      disabled
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="apellido" class="form-label">Apellido </label>
                    <input
                      v-model="form.apellido"
                      type="text"
                      id="apellido"
                      class="form-control bg-light"
                      disabled
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="apodo" class="form-label">Apodo </label>
                    <input
                      v-model="form.apodo"
                      type="text"
                      id="apodo"
                      class="form-control bg-light"
                      disabled
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="celular" class="form-label">Celular </label>
                    <input
                      v-model="form.celular"
                      type="text"
                      id="celular"
                      class="form-control bg-light"
                      disabled
                    />
                  </div>
                  <div class="col-md-12 mb-3">
                    <label for="email" class="form-label">Email </label>
                    <input
                      v-model="form.email"
                      type="email"
                      id="email"
                      class="form-control bg-light"
                      disabled
                    />
                  </div>
                </div>

                <!-- Botón eliminar (solo al editar) -->
                <div v-if="isEditing" class="border-top pt-3 mt-2">
                  <button
                    type="button"
                    class="btn btn-outline-danger w-100"
                    @click="deleteFromModal"
                    :disabled="saving"
                  >
                    <i class="bi bi-trash"></i> Eliminar este registro
                  </button>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
              <button
                type="button"
                class="btn btn-primary"
                @click="saveRecord"
                :disabled="saving || !!dniEditError || !form.nombre"
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
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAll, create, update, remove, sendEmail } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { v4 as uuidv4 } from 'uuid'

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
const dniEditError = ref('')

const form = ref({
  org: '',
  area: '',
  rol: '',
  subrol: '',
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
    (authStore.user?.it_level === 2 && authStore.user?.areas_ref?.includes('ROSH'))
  )
})

const canEditOrg = computed(() => {
  return authStore.user?.it_level === 3
})

const canEditRecord = (record) => {
  if (authStore.user?.it_level === 3) return true
  if (authStore.user?.it_level === 2 && authStore.user?.areas_ref?.includes('ROSH')) {
    return record.org === authStore.user?.organizacion
  }
  return false
}

// Sugerencias para datalists, deduplicadas de los registros existentes
const orgOptions = computed(() =>
  [...new Set(records.value.map((r) => r.org).filter(Boolean))].sort(),
)
const areaOptions = computed(() =>
  [...new Set(records.value.map((r) => r.area).filter(Boolean))].sort(),
)
const rolOptions = computed(() =>
  [...new Set(records.value.map((r) => r.rol).filter(Boolean))].sort(),
)
const subrolOptions = computed(() =>
  [...new Set(records.value.map((r) => r.subrol).filter(Boolean))].sort(),
)

const filteredRecords = computed(() => {
  let filtered = records.value

  if (!searchQuery.value.trim()) {
    return filtered
  }

  const query = normalizeText(searchQuery.value)

  return filtered.filter((record) => {
    return (
      normalizeText(record.org).includes(query) ||
      normalizeText(record.area).includes(query) ||
      normalizeText(record.rol).includes(query) ||
      normalizeText(record.subrol).includes(query) ||
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

const onDniEditChange = () => {
  dniEditError.value = ''
  if (!form.value.dni.toString().trim()) return

  // parseInt en ambos lados, campo DNI en mayúsculas (igual que en main)
  const dniInput = parseInt(form.value.dni)
  const mainUser = mainUsers.value.find((u) => parseInt(u.DNI) === dniInput)
  if (mainUser) {
    // Validar que el usuario pertenezca a la misma organización del form
    const formOrg = (form.value.org || '').trim()
    if (formOrg && mainUser.organizacion && mainUser.organizacion !== formOrg) {
      form.value.nombre = ''
      form.value.apellido = ''
      form.value.apodo = ''
      form.value.celular = ''
      form.value.email = ''
      dniEditError.value = `Este usuario pertenece a la organización "${mainUser.organizacion}", no a "${formOrg}"`
      return
    }

    // Validar que el usuario pertenezca al área asignada en el form
    // areas_ref puede ser string separado por comas: "PEULA,MAJANE,ROSH"
    const userAreas = (mainUser.areas_ref || '').split(',').map((a) => a.trim().toLowerCase())
    const formArea = (form.value.area || '').trim().toLowerCase()

    if (formArea && !userAreas.includes(formArea)) {
      form.value.nombre = ''
      form.value.apellido = ''
      form.value.apodo = ''
      form.value.celular = ''
      form.value.email = ''
      dniEditError.value = `Este usuario no pertenece al área "${form.value.area}" (sus áreas: ${mainUser.areas_ref || 'ninguna'})`
      return
    }

    form.value.nombre = mainUser.nombre || ''
    form.value.apellido = mainUser.apellido || ''
    form.value.apodo = mainUser.apodo || ''
    form.value.celular = mainUser.celular || ''
    form.value.email = mainUser.mail_operativo || mainUser.mail_personal || ''
  } else {
    form.value.nombre = ''
    form.value.apellido = ''
    form.value.apodo = ''
    form.value.celular = ''
    form.value.email = ''
    dniEditError.value = 'DNI no encontrado en la tabla main'
  }
}

const deleteFromModal = async () => {
  if (
    !confirm(
      '¿Estás seguro de que querés eliminar este registro? Esta acción no se puede deshacer.',
    )
  ) {
    return
  }

  try {
    errorMessage.value = ''
    successMessage.value = ''
    await remove('mjlkt', selectedRecord.value.id)
    records.value = records.value.filter((r) => r.id !== selectedRecord.value.id)
    closeModal()
    successMessage.value = 'Registro eliminado correctamente'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err) {
    console.error('Error eliminando registro:', err)
    errorMessage.value = 'Error al eliminar el registro'
  }
}

const openCreateModal = () => {
  isEditing.value = false
  selectedRecord.value = null
  dniEditError.value = ''
  form.value = {
    org: canEditOrg.value ? '' : authStore.user?.organizacion || '',
    area: '',
    rol: '',
    subrol: '',
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
  dniEditError.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  dniEditError.value = ''
  form.value = {
    org: '',
    area: '',
    rol: '',
    subrol: '',
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
      data.id = uuidv4()
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
