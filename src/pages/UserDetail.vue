<template>
  <div class="container mt-4">
    <!-- Encabezado -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <h2><i class="bi bi-person-fill"></i> Detalles de Usuario</h2>
          <router-link to="/" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left"></i> Volver
          </router-link>
        </div>
      </div>
    </div>

    <!-- Error: Usuario no encontrado -->
    <div v-if="notFound" class="alert alert-danger">
      <i class="bi bi-exclamation-circle"></i> No se encontró el usuario con DNI:
      {{ route.params.dni }}
    </div>

    <!-- Error: Sin permisos -->
    <div v-if="noPermission" class="alert alert-warning">
      <i class="bi bi-exclamation-triangle"></i> No tienes permisos para editar este usuario
    </div>

    <!-- Contenido principal -->
    <div v-if="!notFound && !noPermission" class="row">
      <div class="col-md-8">
        <!-- Tarjeta de datos del usuario -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0"><i class="bi bi-person-vcard"></i> Información del Usuario</h5>
          </div>

          <div class="card-body">
            <!-- Cargando -->
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
            </div>

            <!-- Acordeones por temática -->
            <div v-else-if="userData" class="accordion" :id="accordionId">
              <!-- Información Personal -->
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#personal"
                  >
                    <i class="bi bi-person me-2"></i> Información Personal
                  </button>
                </h2>
                <div
                  id="personal"
                  class="accordion-collapse collapse"
                  data-bs-parent="#personal-accordion"
                >
                  <div class="accordion-body p-3">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="text-muted small">DNI</label>
                        <p class="fw-bold">{{ userData.DNI }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">CUIL</label>
                        <p class="fw-bold">{{ userData.CUIL || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Nombre</label>
                        <p class="fw-bold">{{ userData.nombre }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Apellido</label>
                        <p class="fw-bold">{{ userData.apellido }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Nacimiento</label>
                        <p class="fw-bold">{{ userData.nacimiento || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Género</label>
                        <p class="fw-bold">{{ userData.genero || '-' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Contacto -->
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#contacto"
                  >
                    <i class="bi bi-telephone me-2"></i> Contacto
                  </button>
                </h2>
                <div
                  id="contacto"
                  class="accordion-collapse collapse"
                  data-bs-parent="#contacto-accordion"
                >
                  <div class="accordion-body p-3">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="text-muted small">Email</label>
                        <p class="fw-bold text-break">
                          {{
                            userData.email ||
                            userData.mail_operativo ||
                            userData.mail_personal ||
                            '-'
                          }}
                        </p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Teléfono</label>
                        <p class="fw-bold">{{ userData.celular || userData.cellphone || '-' }}</p>
                      </div>
                      <div v-if="userData.mail_operativo" class="col-md-6">
                        <label class="text-muted small">Email Operativo</label>
                        <p class="fw-bold text-break">{{ userData.mail_operativo }}</p>
                      </div>
                      <div v-if="userData.mail_personal" class="col-md-6">
                        <label class="text-muted small">Email Personal</label>
                        <p class="fw-bold text-break">{{ userData.mail_personal }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Domicilio -->
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#domicilio"
                  >
                    <i class="bi bi-houses me-2"></i> Domicilio
                  </button>
                </h2>
                <div
                  id="domicilio"
                  class="accordion-collapse collapse"
                  data-bs-parent="#domicilio-accordion"
                >
                  <div class="accordion-body p-3">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="text-muted small">Dirección 1</label>
                        <p class="fw-bold">{{ userData.direccion1 || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Barrio 1</label>
                        <p class="fw-bold">{{ userData.barrio1 || '-' }}</p>
                      </div>
                    </div>
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="text-muted small">Dirección 2</label>
                        <p class="fw-bold">{{ userData.direccion2 || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Barrio 2</label>
                        <p class="fw-bold">{{ userData.barrio2 || '-' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Médicos -->
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#medicos"
                  >
                    <i class="bi bi-heart-pulse me-2"></i> Médicos
                  </button>
                </h2>
                <div
                  id="medicos"
                  class="accordion-collapse collapse"
                  data-bs-parent="#medicos-accordion"
                >
                  <div class="accordion-body p-3">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="text-muted small">Foto DNI</label>
                        <p class="fw-bold">{{ userData.foto_dni || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Foto Rostro</label>
                        <p class="fw-bold">{{ userData.foto_rostro || '-' }}</p>
                      </div>
                    </div>
                    <div class="row g-3">
                      <div class="col-md-4">
                        <label class="text-muted small">Obra Social / Prepaga</label>
                        <p class="fw-bold">{{ userData.obraSocial || '-' }}</p>
                      </div>
                      <div class="col-md-4">
                        <label class="text-muted small">Plan</label>
                        <p class="fw-bold">{{ userData.obraSocial_Plan || '-' }}</p>
                      </div>
                      <div class="col-md-4">
                        <label class="text-muted small">N° Socio</label>
                        <p class="fw-bold">{{ userData.obraSocial_id || '-' }}</p>
                      </div>
                    </div>
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="text-muted small">Dieta</label>
                        <p class="fw-bold">{{ userData.med_dieta || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Tipo sanguíneo</label>
                        <p class="fw-bold">{{ userData.med_sangre || '-' }}</p>
                      </div>
                    </div>
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="text-muted small">Lesiones, operaciones o medicación</label>
                        <p class="fw-bold">{{ userData.med_historia || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Lesiones/Problemas crónicos</label>
                        <p class="fw-bold">{{ userData.med_problemas || '-' }}</p>
                      </div>
                    </div>
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="text-muted small">Puede hacer act. física</label>
                        <p class="fw-bold">{{ userData.med_act || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Lesiones/Problemas con Act. física</label>
                        <p class="fw-bold">{{ userData.med_actLesion || '-' }}</p>
                      </div>
                    </div>
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="text-muted small">Lesiones, operaciones o medicación</label>
                        <p class="fw-bold">{{ userData.med_historia || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Lesiones/Problemas crónicos</label>
                        <p class="fw-bold">{{ userData.med_problemas || '-' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Organización -->
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#organizacion"
                  >
                    <i class="bi bi-building me-2"></i> Organización
                  </button>
                </h2>
                <div
                  id="organizacion"
                  class="accordion-collapse collapse"
                  data-bs-parent="#organizacion-accordion"
                >
                  <div class="accordion-body p-3">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="text-muted small">Organización</label>
                        <p class="fw-bold">{{ userData.organizacion || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Áreas</label>
                        <p class="fw-bold">{{ userData.areas || '-' }}</p>
                      </div>
                    </div>
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="text-muted small">Apodo</label>
                        <p class="fw-bold">{{ userData.apodo || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Fecha de Ingreso</label>
                        <p class="fw-bold">{{ userData.fecha_ingresoOrg || '-' }}</p>
                      </div>
                    </div>
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="text-muted small">Nivel de HBTJ</label>
                        <p class="fw-bold">{{ userData.nivelHBTJ || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">¿Activo?</label>
                        <p class="fw-bold">
                          {{ userData.activo === 1 ? 'Sí' : 'No' || '-' }}
                        </p>
                      </div>
                    </div>
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="text-muted small">Fecha de Ingreso MILU</label>
                        <p class="fw-bold">{{ userData.fecha_ingresoMilu || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Áreas históricas</label>
                        <p class="fw-bold">
                          {{ userData.areas_historicas || '-' }}
                        </p>
                      </div>
                    </div>
                    <hr />
                    <div class="row g-3">
                      <h3>Cursos</h3>
                      <div class="col-md-4">
                        <label class="text-muted small">Curso Básico</label>
                        <p class="fw-bold">{{ userData.CBok || '-' }}</p>
                      </div>
                      <div class="col-md-4">
                        <label class="text-muted small">Curso TL</label>
                        <p class="fw-bold">
                          {{ userData.curso_TL || '-' }}
                        </p>
                      </div>
                      <div class="col-md-4">
                        <label class="text-muted small">Curso FND</label>
                        <p class="fw-bold">
                          {{ userData.curso_FND || '-' }}
                        </p>
                      </div>
                      <div class="col-md-4">
                        <label class="text-muted small">Curso Avanzado H</label>
                        <p class="fw-bold">{{ userData.curso_AvH || '-' }}</p>
                      </div>
                      <div class="col-md-4">
                        <label class="text-muted small">Curso Avanzado KM</label>
                        <p class="fw-bold">
                          {{ userData.curso_AvKM || '-' }}
                        </p>
                      </div>
                      <div class="col-md-4">
                        <label class="text-muted small">Curso IE</label>
                        <p class="fw-bold">
                          {{ userData.curso_IE || '-' }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Vida y Desarrollo -->
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#desarrollo"
                  >
                    <i class="bi bi-book me-2"></i> Vida y Desarrollo
                  </button>
                </h2>
                <div
                  id="desarrollo"
                  class="accordion-collapse collapse"
                  data-bs-parent="#desarrollo-accordion"
                >
                  <div class="accordion-body p-3">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="text-muted small">Educación</label>
                        <p class="fw-bold">{{ userData.educacion || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Profesión</label>
                        <p class="fw-bold">{{ userData.profesion || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Experiencia</label>
                        <p class="fw-bold">{{ userData.experiencia || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Habilidades</label>
                        <p class="fw-bold">{{ userData.habilidades || '-' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Técnicos -->
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#tecnicos"
                  >
                    <i class="bi bi-gear me-2"></i> Técnicos
                  </button>
                </h2>
                <div
                  id="tecnicos"
                  class="accordion-collapse collapse"
                  data-bs-parent="#tecnicos-accordion"
                >
                  <div class="accordion-body p-3">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="text-muted small">Telegram ID</label>
                        <p class="fw-bold">
                          {{ userData.telegram_id || userData.TelegramID || '-' }}
                        </p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Nivel IT</label>
                        <p class="fw-bold">
                          <span :class="getLevelBadgeClass(userData.it_level)">
                            {{ getLevelName(userData.it_level) }}
                          </span>
                        </p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">ID Javerim</label>
                        <p class="fw-bold">{{ userData.ID_JVR || userData.id_jvr || '-' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="card-footer d-flex gap-2">
            <button @click="openEditForm" class="btn btn-primary" :disabled="loading">
              <i class="bi bi-pencil"></i> Editar Datos
            </button>
            <button v-if="can(3)" class="btn btn-danger" :disabled="loading" @click="handleDelete">
              <i class="bi bi-trash"></i> Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Panel lateral de información -->
      <div class="col-md-4">
        <div class="card shadow-sm bg-light mb-3">
          <div class="card-header bg-info text-white">
            <h6 class="mb-0"><i class="bi bi-shield-check"></i> Permisos de Edición</h6>
          </div>
          <div class="card-body small">
            <p class="mb-2">
              <i class="bi bi-check-circle text-success"></i>
              Puedes editar datos del usuario
            </p>
            <p class="mb-0">
              <i class="bi bi-x-circle text-danger"></i>
              No puedes cambiar el nivel IT
            </p>
          </div>
        </div>

        <div class="card shadow-sm bg-light">
          <div class="card-header bg-warning text-dark">
            <h6 class="mb-0"><i class="bi bi-exclamation-circle"></i> Nota</h6>
          </div>
          <div class="card-body small">
            <p class="mb-0">
              Solo un administrador de nivel 3 puede cambiar el nivel IT de los usuarios.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Componente de formulario (offcanvas) -->
    <ProfileForm
      ref="profileForm"
      :profileData="userData"
      :isEditing="true"
      :showOrgField="true"
      @update="onUserUpdated"
      @close="onFormClosed"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/composables/usePermissions'
import { getAll, remove } from '@/services/api'
import ProfileForm from '@/components/ProfileForm.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { can, getLevelName } = usePermissions()

const profileForm = ref(null)
const userData = ref({})
const loading = ref(true)
const notFound = ref(false)
const noPermission = ref(false)
const accordionId = 'userAccordion'

onMounted(async () => {
  // Verificar que sea nivel 2+
  if (!authStore.user || !can(2)) {
    noPermission.value = true
    return
  }

  await loadUserData()
})

const loadUserData = async () => {
  try {
    loading.value = true
    const dni = parseInt(route.params.dni)

    // Obtener datos de main y users
    const [mainResponse, usersResponse] = await Promise.all([getAll('main'), getAll('users')])

    const mainData = mainResponse.data
    const usersData = usersResponse.data

    // Buscar usuario en main
    const mainRecord = mainData.find((record) => record.DNI === dni)

    // Buscar usuario en users
    const userRecord = usersData.find((user) => user.dni === dni)

    if (!mainRecord && !userRecord) {
      notFound.value = true
      return
    }

    // Combinar datos de ambas tablas
    userData.value = {
      dni: dni,
      DNI: dni,
      CUIL: mainRecord?.CUIL || '',
      nombre: mainRecord?.nombre || '',
      apellido: mainRecord?.apellido || '',
      genero: mainRecord?.genero || '',
      nacimiento: mainRecord?.nacimiento || '',
      email: userRecord?.email || mainRecord?.mail_operativo || mainRecord?.mail_personal || '',
      celular: mainRecord?.celular || userRecord?.cellphone || '',
      mail_operativo: mainRecord?.mail_operativo || '',
      mail_personal: mainRecord?.mail_personal || '',
      direccion1: mainRecord?.direccion1 || '',
      barrio1: mainRecord?.barrio1 || '',
      direccion2: mainRecord?.direccion2 || '',
      barrio2: mainRecord?.barrio2 || '',
      foto_dni: mainRecord?.foto_dni || '',
      foto_rostro: mainRecord?.foto_rostro || '',
      obraSocial: mainRecord?.obraSocial || '',
      obraSocial_Plan: mainRecord?.obraSocial_Plan || '',
      obraSocial_id: mainRecord?.obraSocial_id || '',
      med_dieta: mainRecord?.med_dieta || '',
      med_sangre: mainRecord?.med_sangre || '',
      med_historia: mainRecord?.med_historia || '',
      med_problemas: mainRecord?.med_problemas || '',
      med_act: mainRecord?.med_act || '',
      med_actLesion: mainRecord?.med_actLesion || '',
      organizacion: mainRecord?.organizacion || '',
      areas: mainRecord?.areas || '',
      apodo: mainRecord?.apodo || '',
      fecha_ingresoOrg: mainRecord?.fecha_ingresoOrg || '',
      nivelHBTJ: mainRecord?.nivelHBTJ || '',
      activo: mainRecord?.activo || '',
      fecha_ingresoMilu: mainRecord?.fecha_ingresoMilu || '',
      areas_historicas: mainRecord?.areas_historicas || '',
      CBok: mainRecord?.CBok || '',
      curso_TL: mainRecord?.curso_TL || '',
      curso_FND: mainRecord?.curso_FND || '',
      curso_AvH: mainRecord?.curso_AvH || '',
      curso_AvKM: mainRecord?.curso_AvKM || '',
      curso_IE: mainRecord?.curso_IE || '',
      it_level: userRecord?.it_level || 0,
      fecha_ult: userRecord?.fecha_ult || '',
      TelegramID: userRecord?.TelegramID || '',
    }
  } catch (error) {
    console.error('Error loading user data:', error)
    notFound.value = true
  } finally {
    loading.value = false
  }
}

const openEditForm = () => {
  profileForm.value.open()
}

const onUserUpdated = () => {
  loadUserData()
}

const onFormClosed = () => {
  // Formulario cerrado
}

const handleDelete = async () => {
  if (
    !confirm('¿Estás seguro que deseas eliminar este usuario? Esta acción no se puede deshacer.')
  ) {
    return
  }

  try {
    loading.value = true

    // Eliminar de main
    await remove('main', userData.value.DNI)

    // Eliminar también de users
    try {
      await remove('users', userData.value.dni)
    } catch (err) {
      console.log('No se pudo eliminar de users (puede no existir)')
    }

    router.push('/')
  } catch (error) {
    console.error('Error deleting user:', error)
    alert('Error al eliminar el usuario')
  } finally {
    loading.value = false
  }
}

const getLevelBadgeClass = (level) => {
  const classes = {
    0: 'badge bg-secondary',
    1: 'badge bg-success',
    2: 'badge bg-warning text-dark',
    3: 'badge bg-danger',
  }
  return classes[level] || 'badge bg-secondary'
}
</script>

<style scoped>
.user-item {
  padding: 0.5rem 0;
}

.user-item label {
  display: block;
  margin-bottom: 0.25rem;
}

.user-item p {
  margin: 0;
  font-size: 1rem;
}

.card {
  border-radius: 8px;
  border: none;
}

.card:hover {
  transform: translateY(-2px);
  transition: all 0.2s ease;
}

@media (max-width: 768px) {
  .col-md-4 {
    margin-top: 2rem;
  }
}
</style>
