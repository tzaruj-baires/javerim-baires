<template>
  <div class="container mt-5 mb-5">
    <div class="row justify-content-center">
      <div class="col-lg-7">
        <div class="card shadow-lg">
          <div class="card-header bg-danger text-white">
            <div class="d-flex align-items-center">
              <i class="bi bi-person-dash-fill me-2"></i>
              <h4 class="mb-0">Dar de Baja - Usuario</h4>
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

            <!-- Buscar Usuario -->
            <div class="mb-4">
              <label for="searchDni" class="form-label fw-bold">
                DNI del Usuario a Dar de Baja <span class="text-danger">*</span>
              </label>
              <div class="input-group">
                <input
                  v-model="searchDni"
                  type="number"
                  class="form-control"
                  id="searchDni"
                  placeholder="Ingresa DNI"
                  min="1000000"
                  max="99999999"
                  @blur="searchUser"
                />
                <button
                  class="btn btn-outline-primary"
                  type="button"
                  @click="searchUser"
                  :disabled="isSearching"
                >
                  <span v-if="!isSearching"><i class="bi bi-search me-1"></i>Buscar</span>
                  <span v-else>
                    <span
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Buscando...
                  </span>
                </button>
              </div>
            </div>

            <!-- Datos del Usuario -->
            <div v-if="userData" class="mb-4 p-3 bg-light rounded">
              <h5 class="text-primary mb-3">Datos del Usuario</h5>
              <div class="row">
                <div class="col-md-6">
                  <p><strong>DNI:</strong> {{ userData.DNI }}</p>
                  <p><strong>Nombre:</strong> {{ userData.nombre }} {{ userData.apellido }}</p>
                  <p><strong>Apodo:</strong> {{ userData.apodo || 'N/A' }}</p>
                </div>
                <div class="col-md-6">
                  <p><strong>Organización:</strong> {{ userData.organizacion }}</p>
                  <p><strong>Áreas:</strong> {{ userData.areas || 'N/A' }}</p>
                  <p><strong>Áreas Ref:</strong> {{ userData.areas_ref || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <!-- Formulario de Baja -->
            <div v-if="userData" class="container">
              <!-- Tipo de Baja -->
              <div class="mb-3">
                <label for="tipoBaja" class="form-label fw-bold">
                  Tipo de Baja <span class="text-danger">*</span>
                </label>
                <select v-model="formData.tipo_baja" class="form-select" id="tipoBaja" required>
                  <option value="">Selecciona tipo de baja</option>
                  <option value="Janij">Janij</option>
                  <option value="Voluntario">Voluntario</option>
                </select>
              </div>

              <!-- Años Voluntario -->
              <div class="mb-3">
                <label for="anosVoluntario" class="form-label fw-bold"
                  >Años en la Organización</label
                >
                <input
                  v-model.number="formData.años_voluntario"
                  type="number"
                  class="form-control"
                  id="anosVoluntario"
                  placeholder="Ej: 2"
                  min="0"
                />
              </div>

              <!-- Rol Máximo -->
              <div class="mb-3">
                <label for="rolMax" class="form-label fw-bold">Rol Máximo alcanzado</label>
                <input
                  v-model="formData.rol_max"
                  type="text"
                  class="form-control"
                  id="rolMax"
                  placeholder="Ej: Coordinador"
                />
              </div>

              <!-- Cursos -->
              <div class="mb-3">
                <label class="form-label fw-bold">Cursos realizados</label>
                <div class="input-group mb-3">
                  <select v-model="nuevoCurso.nombre" class="form-select" id="cursosSelect">
                    <option value="">Selecciona un curso</option>
                    <option value="Capacitación">Capacitación</option>
                    <option value="Técnico">Técnico</option>
                    <option value="Liderazgo">Liderazgo</option>
                    <option value="Comunicación">Comunicación</option>
                    <option value="Otro">Otro</option>
                  </select>
                  <input
                    v-model="nuevoCurso.detalle"
                    type="text"
                    class="form-control"
                    placeholder="Detalles del curso"
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="agregarCurso"
                    :disabled="!nuevoCurso.nombre"
                  >
                    <i class="bi bi-plus-lg"></i> Agregar
                  </button>
                </div>
                <div v-if="formData.cursos.length > 0" class="list-group">
                  <div
                    v-for="(curso, index) in formData.cursos"
                    :key="index"
                    class="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{{ curso.nombre }}</strong>
                      <span v-if="curso.detalle" class="text-muted ms-2"
                        >- {{ curso.detalle }}</span
                      >
                    </div>
                    <button
                      type="button"
                      class="btn btn-sm btn-danger"
                      @click="eliminarCurso(index)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
                <small v-else class="text-muted">No hay cursos agregados</small>
              </div>

              <!-- Motivo Tipo (Checkboxes) -->
              <div class="mb-3">
                <label class="form-label fw-bold">
                  Tipo de Motivo <span class="text-danger">*</span>
                </label>
                <div class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="motivoDesmotivacion"
                    value="Desmotivación personal"
                    v-model="formData.motivo_tipo"
                  />
                  <label class="form-check-label" for="motivoDesmotivacion">
                    Desmotivación general
                  </label>
                </div>
                <div class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="motivoFisica"
                    value="Desmotivación en la parte física"
                    v-model="formData.motivo_tipo"
                  />
                  <label class="form-check-label" for="motivoFisica">
                    Desmotivación en la parte física
                  </label>
                </div>
                <div class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="motivoFamilia"
                    value="Problemas familiares"
                    v-model="formData.motivo_tipo"
                  />
                  <label class="form-check-label" for="motivoFamilia"> Problemas familiares </label>
                </div>
                <div class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="motivoTiempo"
                    value="Falta de tiempo"
                    v-model="formData.motivo_tipo"
                  />
                  <label class="form-check-label" for="motivoTiempo"> Falta de tiempo </label>
                </div>
                <div class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="motivoPersonal"
                    value="Problemas personales"
                    v-model="formData.motivo_tipo"
                  />
                  <label class="form-check-label" for="motivoPersonal">
                    Problemas personales
                  </label>
                </div>
                <div class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="motivoCausa"
                    value="No cree en la causa"
                    v-model="formData.motivo_tipo"
                  />
                  <label class="form-check-label" for="motivoCausa"> No cree en la causa </label>
                </div>
                <div class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="motivoOtro"
                    value="Otros"
                    v-model="formData.motivo_tipo"
                  />
                  <label class="form-check-label" for="motivoOtro"> Otros </label>
                </div>
              </div>

              <!-- Motivo Detalle -->
              <div class="mb-3">
                <label for="motivoDetalle" class="form-label fw-bold">
                  Detalle del Motivo <span class="text-danger">*</span>
                </label>
                <textarea
                  v-model="formData.motivo_detalle"
                  class="form-control"
                  id="motivoDetalle"
                  rows="3"
                  placeholder="Describe el motivo de la baja"
                  required
                ></textarea>
              </div>

              <!-- Reunión -->
              <div class="mb-3">
                <label for="reunion" class="form-label fw-bold"
                  >¿Se tuvo reunión de cierre? Detalle cuándo y por qué</label
                >
                <input
                  v-model="formData.reunion"
                  type="text"
                  class="form-control"
                  id="reunion"
                  placeholder="Ej: Sí/No, detalles"
                />
              </div>

              <!-- Miluim -->
              <div class="mb-3">
                <label for="miluim" class="form-label fw-bold"
                  >¿Se pasó su contacto a Miluim?</label
                >
                <input
                  v-model="formData.miluim"
                  type="text"
                  class="form-control"
                  id="miluim"
                  placeholder="Ej: Sí/No, detalles"
                />
              </div>

              <!-- Comentarios -->
              <div class="mb-3">
                <label for="comentarios" class="form-label fw-bold">Comentarios</label>
                <textarea
                  v-model="formData.comentarios"
                  class="form-control"
                  id="comentarios"
                  rows="3"
                  placeholder="Comentarios adicionales"
                ></textarea>
              </div>

              <!-- Botones -->
              <div class="d-flex gap-2 mt-4">
                <button
                  type="button"
                  class="btn btn-danger w-100"
                  :disabled="isLoading"
                  @click="confirmarBaja"
                >
                  <span v-if="!isLoading"> <i class="bi bi-x-lg me-2"></i>Dar de Baja </span>
                  <span v-else>
                    <span
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Procesando...
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
            </div>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="alert alert-warning mt-4">
          <i class="bi bi-exclamation-triangle me-2"></i>
          <small>
            Esta acción es irreversible. El usuario será dado de baja y sus datos serán archivados
            para trazabilidad.
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
import { usePermissions } from '@/composables/usePermissions'

const searchDni = ref('')
const userData = ref(null)
const isSearching = ref(false)

const nuevoCurso = ref({
  nombre: '',
  detalle: '',
})

const formData = ref({
  tipo_baja: '',
  años_voluntario: null,
  rol_max: '',
  cursos: [],
  motivo_tipo: [],
  motivo_detalle: '',
  reunion: '',
  miluim: '',
  comentarios: '',
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Montar componente
onMounted(() => {
  const router = useRouter()
  const { can } = usePermissions()

  // Verificar permisos: solo nivel IT 2 o superior
  if (!can(2)) {
    router.push('/')
    return
  }
})

// Buscar usuario por DNI
const searchUser = async () => {
  if (!searchDni.value) {
    errorMessage.value = 'Ingresa un DNI para buscar'
    return
  }

  try {
    isSearching.value = true
    errorMessage.value = ''
    userData.value = null

    const response = await api.getAll('main')
    const users = response.data || []
    const user = users.find((u) => parseInt(u.DNI) === parseInt(searchDni.value))

    if (!user) {
      errorMessage.value = 'Usuario no encontrado'
      return
    }

    // Verificar permisos para acceder a este usuario
    const { canAccessUser } = usePermissions()
    if (!canAccessUser(user.DNI, user)) {
      errorMessage.value = 'No tienes permisos para dar de baja a este usuario'
      return
    }

    userData.value = user

    // Pre-llenar algunos campos si es posible
    formData.value.años_voluntario = user.años_voluntario || null
    formData.value.rol_max = user.rol_max || ''
    formData.value.cursos = []
  } catch (error) {
    console.error('Error buscando usuario:', error)
    errorMessage.value = 'Error al buscar el usuario'
  } finally {
    isSearching.value = false
  }
}

// Agregar curso
const agregarCurso = () => {
  if (!nuevoCurso.value.nombre) return
  formData.value.cursos.push({
    nombre: nuevoCurso.value.nombre,
    detalle: nuevoCurso.value.detalle,
  })
  nuevoCurso.value = { nombre: '', detalle: '' }
}

// Eliminar curso
const eliminarCurso = (index) => {
  formData.value.cursos.splice(index, 1)
}

// Validar formulario
const validateForm = () => {
  errorMessage.value = ''

  if (!formData.value.tipo_baja) {
    errorMessage.value = 'El tipo de baja es requerido'
    return false
  }

  if (!Array.isArray(formData.value.motivo_tipo) || formData.value.motivo_tipo.length === 0) {
    errorMessage.value = 'Selecciona al menos un tipo de motivo'
    return false
  }

  if (!formData.value.motivo_detalle.trim()) {
    errorMessage.value = 'El detalle del motivo es requerido'
    return false
  }

  return true
}

// Confirmación antes de dar de baja
const confirmarBaja = () => {
  const confirmacion = confirm(
    `¿Estás seguro que deseas dar de baja a ${userData.value.nombre} ${userData.value.apellido}? \n\nEsta acción es irreversible.`,
  )
  if (confirmacion) {
    handleSubmit()
  }
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

    // Unificar cursos en string con comas y saltos de línea
    const cursosString = formData.value.cursos
      .map((c) => `${c.nombre}${c.detalle ? ': ' + c.detalle : ''}`)
      .join(',\n')

    // Unificar motivos en string
    const motivosString = formData.value.motivo_tipo.join(', ')

    // Preparar datos para bajas_activo
    const bajaRecord = {
      dni: userData.value.DNI,
      nombre: userData.value.nombre,
      apellido: userData.value.apellido,
      apodo: userData.value.apodo || '',
      tipo_baja: formData.value.tipo_baja,
      años_voluntario: formData.value.años_voluntario || 0,
      rol_max: formData.value.rol_max,
      areas_historicas: '', // Se llenará según tipo_baja
      cursos: cursosString,
      motivo_tipo: motivosString,
      motivo_detalle: formData.value.motivo_detalle,
      reunion: formData.value.reunion,
      miluim: formData.value.miluim,
      comentarios: formData.value.comentarios,
    }

    // Preparar update para main
    const updateData = {
      DNI: userData.value.DNI,
      activo: 0,
      fecha_ult: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    }

    if (formData.value.tipo_baja === 'Janij') {
      updateData.areas = ''
      updateData.areas_ref = ''
      bajaRecord.areas_historicas = userData.value.areas || ''
    } else if (formData.value.tipo_baja === 'Voluntario') {
      updateData.areas = 'MILU'
      updateData.areas_ref = 'MILU'
      bajaRecord.areas_historicas = userData.value.areas || ''
      updateData.fecha_ingresoMilu = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    }

    // Crear registro en bajas_activo
    await api.create('bajas_activo', bajaRecord)

    // Actualizar main
    await api.update('main', updateData)

    successMessage.value = '¡Usuario dado de baja correctamente!'
    resetForm()

    // Limpiar mensaje de éxito después de 3 segundos
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error al dar de baja:', error)
    errorMessage.value =
      error.response?.data?.message || error.message || 'Error al procesar la baja'
  } finally {
    isLoading.value = false
  }
}

// Limpiar formulario
const resetForm = () => {
  searchDni.value = ''
  userData.value = null
  nuevoCurso.value = { nombre: '', detalle: '' }
  formData.value = {
    tipo_baja: '',
    años_voluntario: null,
    rol_max: '',
    cursos: [],
    motivo_tipo: [],
    motivo_detalle: '',
    reunion: '',
    miluim: '',
    comentarios: '',
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
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.btn-danger,
.btn-secondary {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(220, 53, 69, 0.3);
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

.alert-warning {
  background-color: #fff3cd;
  color: #856404;
}
</style>
