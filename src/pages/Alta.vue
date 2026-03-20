<template>
  <div class="jv-page">
    <!-- ── Header ── -->
    <div class="jv-page-header">
      <div class="jv-page-header__left">
        <div class="jv-page-header__icon jv-page-header__icon--green">
          <i class="bi bi-person-plus-fill"></i>
        </div>
        <div>
          <p class="jv-page-header__eyebrow">Gestión de miembros</p>
          <h1 class="jv-page-header__title">Alta de Usuarios</h1>
        </div>
      </div>
    </div>

    <!-- ── Aviso ── -->
    <div class="jv-alert jv-alert--info alta-info-banner">
      <i class="bi bi-info-circle"></i>
      Al dar de alta, el javer deberá registrarse en el sistema como usuario él mismo.
    </div>

    <!-- ── Panel con tabs ── -->
    <div class="jv-card alta-card">
      <!-- Tabs -->
      <div class="alta-tabs">
        <button
          class="alta-tab"
          :class="{ 'alta-tab--active': activeTab === 'individual' }"
          @click="activeTab = 'individual'"
        >
          <i class="bi bi-person"></i> Alta Individual
        </button>
        <button
          class="alta-tab"
          :class="{ 'alta-tab--active': activeTab === 'masiva' }"
          @click="activeTab = 'masiva'"
        >
          <i class="bi bi-people"></i> Alta Masiva
        </button>
      </div>

      <!-- ── TAB: ALTA INDIVIDUAL ── -->
      <div v-show="activeTab === 'individual'" class="alta-body">
        <!-- Alertas -->
        <div v-if="successMessage" class="jv-alert jv-alert--success alta-alert">
          <i class="bi bi-check-circle"></i> {{ successMessage }}
          <button class="jv-alert__close" @click="successMessage = ''">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div v-if="errorMessage" class="jv-alert jv-alert--danger alta-alert">
          <i class="bi bi-exclamation-circle"></i> {{ errorMessage }}
          <button class="jv-alert__close" @click="errorMessage = ''">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="alta-form">
          <!-- Sección: Identidad -->
          <p class="alta-section-label">Identidad</p>
          <div class="alta-grid">
            <div class="jv-field">
              <label class="jv-label" for="dni">DNI <span class="alta-required">*</span></label>
              <input
                v-model="formData.dni"
                type="number"
                class="jv-input"
                id="dni"
                placeholder="Ej: 12345678"
                min="1000000"
                max="99999999"
                required
                @blur="validateDNI"
              />
              <span class="jv-hint"
                >Entre 7 y 8 dígitos — <strong>verificar dos veces</strong></span
              >
            </div>
            <div class="jv-field">
              <label class="jv-label" for="apodo">Apodo</label>
              <input
                v-model="formData.apodo"
                type="text"
                class="jv-input"
                id="apodo"
                placeholder="Apodo (si aplica)"
              />
            </div>
            <div class="jv-field">
              <label class="jv-label" for="nombre"
                >Nombre <span class="alta-required">*</span></label
              >
              <input
                v-model="formData.nombre"
                type="text"
                class="jv-input"
                id="nombre"
                placeholder="Nombre"
                required
              />
            </div>
            <div class="jv-field">
              <label class="jv-label" for="apellido"
                >Apellido <span class="alta-required">*</span></label
              >
              <input
                v-model="formData.apellido"
                type="text"
                class="jv-input"
                id="apellido"
                placeholder="Apellido"
                required
              />
            </div>
          </div>

          <!-- Sección: Contacto -->
          <p class="alta-section-label">Contacto</p>
          <div class="alta-grid">
            <div class="jv-field">
              <label class="jv-label" for="celular"
                >Celular <span class="alta-required">*</span></label
              >
              <input
                v-model="formData.celular"
                type="tel"
                class="jv-input"
                id="celular"
                placeholder="Ej: 1123456789"
                required
              />
              <span class="jv-hint"><strong>Verificar dos veces</strong></span>
            </div>
            <div class="jv-field">
              <label class="jv-label" for="mailOperativo">Email Operativo</label>
              <input
                v-model="formData.mailOperativo"
                type="email"
                class="jv-input"
                id="mailOperativo"
                placeholder="usuario@example.com"
              />
            </div>
            <div class="jv-field alta-grid--full">
              <label class="jv-label" for="mailPersonal">Email Personal</label>
              <input
                v-model="formData.mailPersonal"
                type="email"
                class="jv-input"
                id="mailPersonal"
                placeholder="personal@example.com"
              />
            </div>
          </div>

          <!-- Sección: Organización -->
          <p class="alta-section-label">Organización</p>
          <div class="alta-grid">
            <div class="jv-field">
              <label class="jv-label" for="organizacion"
                >Organización <span class="alta-required">*</span></label
              >
              <select
                v-model="formData.organizacion"
                class="jv-input jv-select"
                id="organizacion"
                required
              >
                <option value="">Seleccioná una organización</option>
                <option v-for="org in organizaciones" :key="org" :value="org">{{ org }}</option>
              </select>
            </div>
            <div class="jv-field">
              <!-- placeholder vacío para alinear al grid -->
            </div>
            <div class="jv-field">
              <label class="jv-label" for="areasRef">Áreas de Referencia</label>
              <select
                v-model="formData.areasRef"
                multiple
                class="jv-input jv-select alta-multi"
                id="areasRef"
                :disabled="!formData.organizacion"
                size="5"
              >
                <option :value="area" v-for="area in areasRefDisponibles" :key="area">
                  {{ area }}
                </option>
              </select>
              <span class="jv-hint">Ctrl/Cmd + clic para seleccionar múltiples</span>
            </div>
            <div class="jv-field">
              <label class="jv-label" for="areas">Roles</label>
              <select
                v-model="formData.areas"
                multiple
                class="jv-input jv-select alta-multi"
                id="areas"
                :disabled="!formData.organizacion || formData.areasRef.length === 0"
                size="5"
              >
                <option :value="rol" v-for="rol in rolesDisponibles" :key="rol">{{ rol }}</option>
              </select>
              <span class="jv-hint">Ctrl/Cmd + clic para seleccionar múltiples</span>
            </div>
          </div>

          <!-- Botones -->
          <div class="alta-actions">
            <button
              type="submit"
              class="jv-btn jv-btn--success"
              style="flex: 1"
              :disabled="isLoading"
            >
              <span v-if="!isLoading"><i class="bi bi-check-circle"></i> Dar de Alta</span>
              <span v-else class="alta-loading">
                <span class="jv-spinner jv-spinner--sm jv-spinner--white"></span> Registrando...
              </span>
            </button>
            <button
              type="button"
              class="jv-btn jv-btn--ghost"
              @click="resetForm"
              :disabled="isLoading"
            >
              <i class="bi bi-arrow-clockwise"></i> Limpiar
            </button>
          </div>
        </form>
      </div>

      <!-- ── TAB: ALTA MASIVA ── -->
      <div v-show="activeTab === 'masiva'" class="alta-body">
        <AltaMasiva />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as api from '@/services/api'
import { organizaciones } from '@/utils/forms_consts'
import { usePermissions } from '@/composables/usePermissions'
import AltaMasiva from '@/components/AltaMasiva.vue'

const activeTab = ref('individual')

const formData = ref({
  dni: '',
  nombre: '',
  apellido: '',
  apodo: '',
  mailOperativo: '',
  mailPersonal: '',
  celular: '',
  organizacion: '',
  areas: [],
  areasRef: [],
})

const mjlktData = ref([])

const areasRefDisponibles = computed(() => {
  const org = formData.value.organizacion
  if (!org) return []
  return [
    ...new Set(mjlktData.value.filter((item) => item.org === org).map((item) => item.area)),
  ].sort()
})

const rolesDisponibles = computed(() => {
  const org = formData.value.organizacion
  const areasRef = formData.value.areasRef
  if (!org || !Array.isArray(areasRef) || areasRef.length === 0) return []
  return [
    ...new Set(
      mjlktData.value
        .filter((item) => item.org === org && areasRef.includes(item.area))
        .map((item) => item.rol),
    ),
  ].sort()
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const loadMjlktData = async () => {
  try {
    const response = await api.getAll('mjlkt')
    mjlktData.value = response.data || []
  } catch (error) {
    console.error('Error loading mjlkt data:', error)
  }
}

onMounted(() => {
  const router = useRouter()
  const { can } = usePermissions()
  if (!can(2)) {
    router.push('/')
    return
  }
  loadMjlktData()
})

const validateDNI = () => {
  const dniLength = formData.value.dni.toString().length
  if (dniLength > 0 && (dniLength < 7 || dniLength > 8)) {
    errorMessage.value = 'El DNI debe tener entre 7 y 8 dígitos'
  } else {
    if (errorMessage.value === 'El DNI debe tener entre 7 y 8 dígitos') {
      errorMessage.value = ''
    }
  }
}

const validateForm = () => {
  errorMessage.value = ''
  if (!formData.value.dni) {
    errorMessage.value = 'El DNI es requerido'
    return false
  }
  if (!formData.value.nombre) {
    errorMessage.value = 'El nombre es requerido'
    return false
  }
  if (!formData.value.apellido) {
    errorMessage.value = 'El apellido es requerido'
    return false
  }
  if (!formData.value.celular) {
    errorMessage.value = 'El celular es requerido'
    return false
  }
  if (!formData.value.organizacion) {
    errorMessage.value = 'La organización es requerida'
    return false
  }

  const dniLength = formData.value.dni.toString().length
  if (dniLength < 7 || dniLength > 8) {
    errorMessage.value = 'El DNI debe tener entre 7 y 8 dígitos'
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.value.mailOperativo)) {
    errorMessage.value = 'El email operativo debe ser válido'
    return false
  }
  if (formData.value.mailPersonal && !emailRegex.test(formData.value.mailPersonal)) {
    errorMessage.value = 'El email personal debe ser válido'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const now = new Date()
    const fechaUlt = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const newUser = {
      ID_JVR: `${formData.value.organizacion ? formData.value.organizacion : 'JVR'}@${parseInt(formData.value.dni)}`,
      fecha_ult: fechaUlt,
      DNI: parseInt(formData.value.dni),
      nombre: formData.value.nombre,
      apellido: formData.value.apellido,
      apodo: formData.value.apodo,
      email: formData.value.mailOperativo,
      celular: formData.value.celular,
      mail_operativo: formData.value.mailOperativo,
      mail_personal: formData.value.mailPersonal,
      organizacion: formData.value.organizacion,
      areas: Array.isArray(formData.value.areas)
        ? formData.value.areas.join(', ')
        : formData.value.areas,
      areas_ref: Array.isArray(formData.value.areasRef)
        ? formData.value.areasRef.join(', ')
        : formData.value.areasRef,
    }

    const mainResponse = await api.getAll('main')
    const mainRecords = mainResponse.data
    const dniExists = mainRecords.some(
      (record) => parseInt(record.DNI) === parseInt(formData.value.dni),
    )

    if (dniExists) {
      errorMessage.value = 'Este DNI ya está registrado en el sistema'
      return
    }

    await api.create('main', newUser)
    successMessage.value = '¡Usuario dado de alta correctamente!'
    resetForm()

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error al dar de alta:', error)
    errorMessage.value =
      error.response?.data?.message || error.message || 'Error al registrar el usuario'
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    dni: '',
    nombre: '',
    apellido: '',
    apodo: '',
    mailOperativo: '',
    mailPersonal: '',
    celular: '',
    organizacion: '',
    areas: [],
    areasRef: [],
  }
  errorMessage.value = ''
}
</script>

<style scoped>
@import '@/assets/css/styles.css';

/* ── Info banner ── */
.alta-info-banner {
  margin-bottom: 1.25rem;
  font-size: 0.875rem;
}

/* ── Card ── */
.alta-card {
  overflow: visible;
}

/* ── Tabs ── */
.alta-tabs {
  display: flex;
  border-bottom: 1px solid var(--jv-border);
  background: #f8fafc;
}

.alta-tab {
  flex: 1;
  padding: 0.8rem 1rem;
  border: none;
  background: transparent;
  color: var(--jv-text-muted);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition:
    color 0.15s,
    border-color 0.15s,
    background 0.15s;
  font-family: var(--jv-font);
}

.alta-tab:hover {
  color: var(--jv-accent);
  background: #eef2ff;
}

.alta-tab--active {
  color: var(--jv-accent);
  border-bottom-color: var(--jv-accent);
  background: white;
}

/* ── Body ── */
.alta-body {
  padding: 1.25rem;
}

/* ── Alert ── */
.alta-alert {
  margin-bottom: 1.25rem;
  font-size: 0.85rem;
}

/* ── Form ── */
.alta-form {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.alta-section-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--jv-accent);
  margin: 0.75rem 0 0.5rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--jv-border);
}

.alta-section-label:first-child {
  margin-top: 0;
}

.alta-required {
  color: var(--jv-danger);
  font-weight: 700;
}

/* ── Grid ── */
.alta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem 1rem;
}

.alta-grid--full {
  grid-column: 1 / -1;
}

.alta-multi {
  min-height: 120px;
}

/* ── Actions ── */
.alta-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--jv-border);
}

.alta-loading {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .alta-grid {
    grid-template-columns: 1fr;
  }
  .alta-tab span {
    display: none;
  }
}
</style>
