<template>
  <div class="container mt-5 mb-5">
    <div class="row justify-content-center">
      <div class="col-lg-7">
        <div class="card shadow-lg">
          <div class="card-header bg-primary text-white">
            <div class="d-flex align-items-center">
              <i class="bi bi-person-plus-fill me-2"></i>
              <h4 class="mb-0">Dar de Alta - Nuevo Usuario</h4>
            </div>
          </div>

          <div class="card-body p-4">
            <!-- Mensaje de éxito -->
            <div
              v-if="successMessage"
              class="alert alert-success alert-dismissible fade show"
              role="alert"
            >
              <i class="bi bi-check-circle me-2"></i>
              {{ successMessage }}
              <button type="button" class="btn-close" @click="successMessage = ''"></button>
            </div>

            <!-- Mensaje de error -->
            <div
              v-if="errorMessage"
              class="alert alert-danger alert-dismissible fade show"
              role="alert"
            >
              <i class="bi bi-exclamation-triangle me-2"></i>
              {{ errorMessage }}
              <button type="button" class="btn-close" @click="errorMessage = ''"></button>
            </div>

            <!-- Formulario -->
            <form @submit.prevent="handleSubmit" class="container">
              <!-- DNI -->
              <div class="mb-3">
                <label for="dni" class="form-label fw-bold">
                  DNI <span class="text-danger">*</span>
                </label>
                <input
                  v-model="formData.dni"
                  type="number"
                  class="form-control"
                  id="dni"
                  placeholder="Ej: 12345678"
                  min="1000000"
                  max="99999999"
                  required
                  @blur="validateDNI"
                />
                <small class="text-muted">Entre 7 y 8 dígitos. CHEQUEAR DOS VECES</small>
              </div>

              <!-- Nombre -->
              <div class="mb-3">
                <label for="nombre" class="form-label fw-bold">
                  Nombre <span class="text-danger">*</span>
                </label>
                <input
                  v-model="formData.nombre"
                  type="text"
                  class="form-control"
                  id="nombre"
                  placeholder="Ingresa tu nombre"
                  required
                />
              </div>

              <!-- Apellido -->
              <div class="mb-3">
                <label for="apellido" class="form-label fw-bold">
                  Apellido <span class="text-danger">*</span>
                </label>
                <input
                  v-model="formData.apellido"
                  type="text"
                  class="form-control"
                  id="apellido"
                  placeholder="Ingresa tu apellido"
                  required
                />
              </div>

              <!-- Apodo (Nickname) -->
              <div class="mb-3">
                <label for="apodo" class="form-label fw-bold"> Apodo </label>
                <input
                  v-model="formData.apodo"
                  type="text"
                  class="form-control"
                  id="apodo"
                  placeholder="Ingrese su apodo (si aplica)"
                />
              </div>

              <!-- Email Operativo -->
              <div class="mb-3">
                <label for="mailOperativo" class="form-label fw-bold"> Email Operativo </label>
                <input
                  v-model="formData.mailOperativo"
                  type="email"
                  class="form-control"
                  id="mailOperativo"
                  placeholder="usuario@example.com"
                />
              </div>

              <!-- Email Personal -->
              <div class="mb-3">
                <label for="mailPersonal" class="form-label fw-bold">Email Personal</label>
                <input
                  v-model="formData.mailPersonal"
                  type="email"
                  class="form-control"
                  id="mailPersonal"
                  placeholder="personal@example.com"
                />
              </div>

              <!-- Celular -->
              <div class="mb-3">
                <label for="celular" class="form-label fw-bold">
                  Celular <span class="text-danger">*</span>
                </label>
                <input
                  v-model="formData.celular"
                  type="tel"
                  class="form-control"
                  id="celular"
                  placeholder="Ej: 1123456789"
                  required
                />
                <small class="text-muted">CHEQUEAR DOS VECES</small>
              </div>

              <!-- Organización -->
              <div class="mb-3">
                <label for="organizacion" class="form-label fw-bold">
                  Organización <span class="text-danger">*</span>
                </label>
                <select
                  v-model="formData.organizacion"
                  class="form-select"
                  id="organizacion"
                  required
                >
                  <option value="">Selecciona una organización</option>
                  <option v-for="org in organizaciones" :key="org" :value="org">{{ org }}</option>
                </select>
              </div>

              <!-- Áreas de Referencia -->
              <div class="mb-3">
                <label for="areasRef" class="form-label fw-bold"> Áreas de Referencia </label>
                <select
                  v-model="formData.areasRef"
                  multiple
                  class="form-select"
                  id="areasRef"
                  :disabled="!formData.organizacion"
                  size="5"
                >
                  <option :value="area" v-for="area in areasRefDisponibles" :key="area">
                    {{ area }}
                  </option>
                </select>
                <small class="text-muted">Selecciona una o más áreas (Ctrl/Cmd + clic)</small>
              </div>

              <!-- Roles (Áreas) -->
              <div class="mb-3">
                <label for="areas" class="form-label fw-bold"> Roles </label>
                <select
                  v-model="formData.areas"
                  multiple
                  class="form-select"
                  id="areas"
                  :disabled="!formData.organizacion || formData.areasRef.length === 0"
                  size="5"
                >
                  <option :value="rol" v-for="rol in rolesDisponibles" :key="rol">
                    {{ rol }}
                  </option>
                </select>

                <small class="text-muted">Selecciona uno o más roles (Ctrl/Cmd + clic)</small>
              </div>

              <!-- Botones -->
              <div class="d-flex gap-2 mt-4">
                <button type="submit" class="btn btn-primary w-100" :disabled="isLoading">
                  <span v-if="!isLoading"> <i class="bi bi-check-lg me-2"></i>Dar de Alta </span>
                  <span v-else>
                    <span
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Registrando...
                  </span>
                </button>
                <button
                  type="button"
                  class="btn btn-secondary w-100"
                  @click="resetForm"
                  :disabled="isLoading"
                >
                  <i class="bi bi-arrow-clockwise me-2"></i>Limpiar
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="alert alert-info mt-4">
          <i class="bi bi-info-circle me-2"></i>
          <small>
            Al dar de alta, el javer se tendrá que registrar al sistema como usuario él mismo.
          </small>
        </div>
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

// Datos de mjlkt para filtrar áreas y roles
const mjlktData = ref([])

// Computed: áreas de referencia disponibles basadas en la organización
const areasRefDisponibles = computed(() => {
  const org = formData.value.organizacion
  if (!org) return []
  // Obtener areas_ref únicas para la organización
  return [
    ...new Set(mjlktData.value.filter((item) => item.org === org).map((item) => item.area)),
  ].sort()
})

// Computed: roles disponibles basados en la organización y áreas_ref seleccionadas
const rolesDisponibles = computed(() => {
  const org = formData.value.organizacion
  const areasRef = formData.value.areasRef
  if (!org || !Array.isArray(areasRef) || areasRef.length === 0) return []
  // Obtener roles que coincidan con org y CUALQUIERA de las areas_ref seleccionadas
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

// Cargar datos de mjlkt
const loadMjlktData = async () => {
  try {
    const response = await api.getAll('mjlkt')
    mjlktData.value = response.data || []
  } catch (error) {
    console.error('Error loading mjlkt data:', error)
  }
}

// Montar componente
onMounted(() => {
  const router = useRouter()
  const { can } = usePermissions()

  // Verificar permisos: solo nivel IT 2 o superior
  if (!can(2)) {
    router.push('/')
    return
  }

  loadMjlktData()
})

// Validar DNI
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

// Validar formulario
const validateForm = () => {
  errorMessage.value = ''

  // Campos obligatorios
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

  // Validar DNI length
  const dniLength = formData.value.dni.toString().length
  if (dniLength < 7 || dniLength > 8) {
    errorMessage.value = 'El DNI debe tener entre 7 y 8 dígitos'
    return false
  }

  // Validar emails
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

// Manejar envío del formulario
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    // Preparar datos para API
    const newUser = {
      ID_JVR: `${formData.value.organizacion ? formData.value.organizacion : 'JVR'}@${parseInt(formData.value.dni)}`, // Se asignará automáticamente
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

    // Verificar que el DNI no esté duplicado
    const mainResponse = await api.getAll('main')
    const mainRecords = mainResponse.data
    const dniExists = mainRecords.some(
      (record) => parseInt(record.DNI) === parseInt(formData.value.dni),
    )

    if (dniExists) {
      errorMessage.value = 'Este DNI ya está registrado en el sistema'
      return
    }

    // Crear el registro en la tabla main
    await api.create('main', newUser)

    successMessage.value = '¡Usuario dado de alta correctamente!'
    resetForm()

    // Limpiar mensaje de éxito después de 3 segundos
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

// Limpiar formulario
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
.card {
  border: none;
  border-radius: 10px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.card-header {
  border-radius: 10px 10px 0 0;
  font-weight: 500;
}

.form-label {
  color: #333;
  font-size: 0.95rem;
}

.form-control,
.form-select {
  border-radius: 6px;
  border: 1px solid #dee2e6;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.btn-primary,
.btn-secondary {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(13, 110, 253, 0.3);
}

.btn-secondary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(108, 117, 125, 0.3);
}

.text-danger {
  font-weight: bold;
}

small {
  display: block;
  margin-top: 0.25rem;
}

.alert {
  border-radius: 6px;
  border: none;
}

.alert-info {
  background-color: #e7f3ff;
  color: #004085;
}
</style>
