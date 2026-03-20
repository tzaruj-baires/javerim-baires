<template>
  <div class="jv-page">
    <!-- ── Acceso denegado ── -->
    <div v-if="authStore.user?.it_level <= 1" class="jv-denied">
      <i class="bi bi-shield-lock"></i>
      <h4>Acceso Denegado</h4>
      <p>No tenés permisos para ver esta página.</p>
    </div>

    <template v-else>
      <!-- ── Header ── -->
      <div class="jv-page-header">
        <div class="jv-page-header__left">
          <div class="jv-page-header__icon jv-page-header__icon--purple">
            <i class="bi bi-stack"></i>
          </div>
          <div>
            <p class="jv-page-header__eyebrow">Panel de administración</p>
            <h1 class="jv-page-header__title">Áreas y Roshim</h1>
          </div>
        </div>
        <button v-if="canEdit" class="jv-btn jv-btn--success" @click="openCreateModal">
          <i class="bi bi-plus-circle"></i>
          <span class="jv-btn__label">Agregar registro</span>
        </button>
      </div>

      <!-- ── Alertas ── -->
      <div v-if="successMessage" class="jv-alert jv-alert--success">
        <i class="bi bi-check-circle"></i>
        {{ successMessage }}
        <button class="jv-alert__close" @click="successMessage = ''">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div v-if="errorMessage" class="jv-alert jv-alert--danger">
        <i class="bi bi-exclamation-circle"></i>
        {{ errorMessage }}
        <button class="jv-alert__close" @click="errorMessage = ''">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- ── Tabla MJLKT ── -->
      <div class="jv-table-panel">
        <div class="jv-table-panel__header">
          <div class="jv-table-panel__title-row">
            <i class="bi bi-table"></i>
            <h2 class="jv-table-panel__title">Registros MJLKT</h2>
            <span class="jv-table-panel__count" v-if="!loading">{{ filteredRecords.length }}</span>
          </div>
          <div class="jv-search">
            <i class="bi bi-search jv-search__icon"></i>
            <input
              v-model="searchQuery"
              type="text"
              class="jv-search__input"
              placeholder="Buscar por org, área, rol, DNI, nombre..."
            />
            <button v-if="searchQuery" @click="searchQuery = ''" class="jv-search__clear">
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>

        <div class="jv-table-wrap">
          <table class="jv-table">
            <thead>
              <tr>
                <th class="sortable" @click="sortBy('org')">
                  Org <span class="ar-sort">{{ getSortIndicator('org') }}</span>
                </th>
                <th class="sortable" @click="sortBy('area')">
                  Área <span class="ar-sort">{{ getSortIndicator('area') }}</span>
                </th>
                <th class="sortable" @click="sortBy('rol')">
                  Rol <span class="ar-sort">{{ getSortIndicator('rol') }}</span>
                </th>
                <th class="sortable jv-hide-sm" @click="sortBy('subrol')">
                  Subrol <span class="ar-sort">{{ getSortIndicator('subrol') }}</span>
                </th>
                <th class="sortable" @click="sortBy('dni')">
                  DNI <span class="ar-sort">{{ getSortIndicator('dni') }}</span>
                </th>
                <th class="sortable" @click="sortBy('nombre')">
                  Nombre <span class="ar-sort">{{ getSortIndicator('nombre') }}</span>
                </th>
                <th class="sortable jv-hide-sm" @click="sortBy('apellido')">
                  Apellido <span class="ar-sort">{{ getSortIndicator('apellido') }}</span>
                </th>
                <th class="sortable jv-hide-sm" @click="sortBy('apodo')">
                  Apodo <span class="ar-sort">{{ getSortIndicator('apodo') }}</span>
                </th>
                <th class="sortable jv-hide-sm" @click="sortBy('celular')">
                  Celular <span class="ar-sort">{{ getSortIndicator('celular') }}</span>
                </th>
                <th class="sortable jv-hide-sm" @click="sortBy('email')">
                  Email <span class="ar-sort">{{ getSortIndicator('email') }}</span>
                </th>
                <th class="center" v-if="canEdit">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td :colspan="canEdit ? 11 : 10">
                  <div class="jv-loading-row"><span class="jv-spinner"></span> Cargando...</div>
                </td>
              </tr>
              <tr v-else-if="filteredRecords.length === 0">
                <td :colspan="canEdit ? 11 : 10" class="jv-table__empty">
                  <i class="bi bi-inbox"></i>
                  No hay registros
                </td>
              </tr>
              <tr v-else v-for="record in paginatedRecords" :key="record.id">
                <td>
                  <span class="jv-badge jv-badge--org">{{ record.org }}</span>
                </td>
                <td>{{ record.area }}</td>
                <td>{{ record.rol }}</td>
                <td class="jv-hide-sm">{{ record.subrol || '—' }}</td>
                <td>
                  <span class="jv-mono">{{ record.dni }}</span>
                </td>
                <td class="ar-name">{{ record.nombre }}</td>
                <td class="jv-hide-sm">{{ record.apellido }}</td>
                <td class="jv-hide-sm">{{ record.apodo || '—' }}</td>
                <td class="jv-hide-sm">
                  <a
                    :href="`https://wa.me/${record.celular}`"
                    class="jv-link jv-link--phone"
                    v-if="record.celular"
                    target="_blank"
                  >
                    <i class="bi bi-whatsapp"></i> {{ record.celular }}
                  </a>
                  <span v-else>—</span>
                </td>
                <td class="jv-hide-sm">
                  <a v-if="record.email" :href="`mailto:${record.email}`" class="jv-link">{{
                    record.email
                  }}</a>
                  <span v-else>—</span>
                </td>
                <td class="center" v-if="canEdit">
                  <div class="ar-actions" v-if="canEditRecord(record)">
                    <button
                      @click="openEditModal(record)"
                      class="jv-action-btn jv-action-btn--edit"
                      title="Editar"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      @click="deleteRecord(record.id)"
                      class="jv-action-btn jv-action-btn--delete"
                      title="Eliminar"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="jv-table-footer">
          <span class="jv-table-footer__info">
            Mostrando <strong>{{ paginatedRecords.length }}</strong> de
            <strong>{{ filteredRecords.length }}</strong> registros
          </span>
          <div class="jv-table-footer__actions">
            <button
              v-if="displayedCount < filteredRecords.length"
              @click="loadMore"
              class="jv-btn jv-btn--ghost jv-btn--sm"
            >
              <i class="bi bi-chevron-down"></i> Más
            </button>
            <button
              v-if="displayedCount > itemsPerPage"
              @click="showLess"
              class="jv-btn jv-btn--ghost jv-btn--sm"
            >
              <i class="bi bi-chevron-up"></i> Menos
            </button>
          </div>
        </div>
      </div>

      <!-- ── Modal crear / editar ── -->
      <div v-if="showModal" class="jv-modal-backdrop" @click.self="closeModal">
        <div class="jv-modal jv-modal--lg">
          <div class="jv-modal__header">
            <h3 class="jv-modal__title">
              <i :class="isEditing ? 'bi bi-pencil-square' : 'bi bi-plus-circle'"></i>
              {{ isEditing ? 'Editar Registro' : 'Nuevo Registro' }}
            </h3>
            <button class="jv-modal__close" @click="closeModal">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="jv-modal__body">
            <form @submit.prevent="saveRecord">
              <!-- Sección: identificación del área/rol -->
              <p class="ar-modal-section">Área y Rol</p>
              <div class="jv-form-grid">
                <div class="jv-field">
                  <label class="jv-label" for="org">Organización</label>
                  <input
                    v-model="form.org"
                    type="text"
                    id="org"
                    class="jv-input"
                    :class="{ 'jv-input--disabled': !canEditOrg }"
                    required
                    :disabled="!canEditOrg"
                    list="list-org"
                  />
                  <datalist id="list-org">
                    <option v-for="opt in orgOptions" :key="opt" :value="opt" />
                  </datalist>
                </div>
                <div class="jv-field">
                  <label class="jv-label" for="area">Área</label>
                  <input
                    v-model="form.area"
                    type="text"
                    id="area"
                    class="jv-input"
                    required
                    list="list-area"
                    @input="form.dni ? onDniEditChange() : null"
                  />
                  <datalist id="list-area">
                    <option v-for="opt in areaOptions" :key="opt" :value="opt" />
                  </datalist>
                </div>
                <div class="jv-field">
                  <label class="jv-label" for="rol">Rol</label>
                  <input
                    v-model="form.rol"
                    type="text"
                    id="rol"
                    class="jv-input"
                    required
                    list="list-rol"
                  />
                  <datalist id="list-rol">
                    <option v-for="opt in rolOptions" :key="opt" :value="opt" />
                  </datalist>
                </div>
                <div class="jv-field">
                  <label class="jv-label" for="subrol">Subrol</label>
                  <input
                    v-model="form.subrol"
                    type="text"
                    id="subrol"
                    class="jv-input"
                    list="list-subrol"
                  />
                  <datalist id="list-subrol">
                    <option v-for="opt in subrolOptions" :key="opt" :value="opt" />
                  </datalist>
                </div>
              </div>

              <!-- Sección: persona -->
              <p class="ar-modal-section">Persona</p>
              <div class="jv-form-grid">
                <div class="jv-field">
                  <label class="jv-label" for="dni">DNI</label>
                  <input
                    v-model="form.dni"
                    type="text"
                    id="dni"
                    class="jv-input"
                    required
                    @input="onDniEditChange"
                  />
                  <span class="jv-hint"
                    >Al ingresar el DNI se cargan los datos automáticamente</span
                  >
                  <span v-if="dniEditError" class="jv-field-error">
                    <i class="bi bi-exclamation-circle"></i> {{ dniEditError }}
                  </span>
                </div>
                <div class="jv-field">
                  <label class="jv-label" for="nombre">Nombre</label>
                  <input
                    v-model="form.nombre"
                    type="text"
                    id="nombre"
                    class="jv-input jv-input--disabled"
                    disabled
                  />
                </div>
                <div class="jv-field">
                  <label class="jv-label" for="apellido">Apellido</label>
                  <input
                    v-model="form.apellido"
                    type="text"
                    id="apellido"
                    class="jv-input jv-input--disabled"
                    disabled
                  />
                </div>
                <div class="jv-field">
                  <label class="jv-label" for="apodo">Apodo</label>
                  <input
                    v-model="form.apodo"
                    type="text"
                    id="apodo"
                    class="jv-input jv-input--disabled"
                    disabled
                  />
                </div>
                <div class="jv-field">
                  <label class="jv-label" for="celular">Celular</label>
                  <input
                    v-model="form.celular"
                    type="text"
                    id="celular"
                    class="jv-input jv-input--disabled"
                    disabled
                  />
                </div>
                <div class="jv-field jv-form-grid--full">
                  <label class="jv-label" for="email">Email</label>
                  <input
                    v-model="form.email"
                    type="email"
                    id="email"
                    class="jv-input jv-input--disabled"
                    disabled
                  />
                </div>
              </div>

              <!-- Eliminar (solo edición) -->
              <div v-if="isEditing" class="ar-modal-delete">
                <button
                  type="button"
                  class="jv-btn jv-btn--outline-danger"
                  style="width: 100%"
                  @click="deleteFromModal"
                  :disabled="saving"
                >
                  <i class="bi bi-trash"></i> Eliminar este registro
                </button>
              </div>
            </form>
          </div>

          <div class="jv-modal__footer">
            <button type="button" class="jv-btn jv-btn--ghost" @click="closeModal">Cancelar</button>
            <button
              type="button"
              class="jv-btn jv-btn--primary"
              @click="saveRecord"
              :disabled="saving || !!dniEditError || !form.nombre"
            >
              <span v-if="!saving">
                <i :class="isEditing ? 'bi bi-check-circle' : 'bi bi-plus-circle'"></i>
                {{ isEditing ? 'Actualizar' : 'Guardar' }}
              </span>
              <span v-else class="ar-loading-text">
                <span class="jv-spinner jv-spinner--sm jv-spinner--white"></span>
                Guardando...
              </span>
            </button>
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

  const dniInput = parseInt(form.value.dni)
  const mainUser = mainUsers.value.find((u) => parseInt(u.DNI) === dniInput)
  if (mainUser) {
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
/* Solo estilos no cubiertos por javerim.css */
.ar-sort {
  opacity: 0.55;
  font-size: 0.65rem;
}

.ar-name {
  font-weight: 500;
}

.ar-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}

.ar-modal-section {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--jv-accent);
  margin: 1rem 0 0.6rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid var(--jv-border);
}

.ar-modal-section:first-child {
  margin-top: 0;
}

.ar-modal-delete {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--jv-border);
}

.ar-loading-text {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
</style>
