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
      <i class="bi bi-exclamation-triangle"></i> No tienes permisos para ver este usuario
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
              <!-- 1. Información Personal -->
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    :data-bs-target="`#personal-${accordionId}`"
                  >
                    <i class="bi bi-person me-2"></i> Información personal
                  </button>
                </h2>
                <div
                  :id="`personal-${accordionId}`"
                  class="accordion-collapse collapse"
                  :data-bs-parent="`#${accordionId}`"
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

              <!-- 2. Contacto -->
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    :data-bs-target="`#contacto-${accordionId}`"
                  >
                    <i class="bi bi-telephone me-2"></i> Contacto
                  </button>
                </h2>
                <div
                  :id="`contacto-${accordionId}`"
                  class="accordion-collapse collapse"
                  :data-bs-parent="`#${accordionId}`"
                >
                  <div class="accordion-body p-3">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="text-muted small">Celular</label>
                        <p class="fw-bold">{{ userData.celular || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Email Personal</label>
                        <p class="fw-bold text-break">{{ userData.mail_personal || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Email Operativo</label>
                        <p class="fw-bold text-break">{{ userData.mail_operativo || '-' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 3. Domicilio -->
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    :data-bs-target="`#domicilio-${accordionId}`"
                  >
                    <i class="bi bi-houses me-2"></i> Domicilio
                  </button>
                </h2>
                <div
                  :id="`domicilio-${accordionId}`"
                  class="accordion-collapse collapse"
                  :data-bs-parent="`#${accordionId}`"
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

              <!-- 4. Médicos -->
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    :data-bs-target="`#medicos-${accordionId}`"
                  >
                    <i class="bi bi-heart-pulse me-2"></i> Médicos
                  </button>
                </h2>
                <div
                  :id="`medicos-${accordionId}`"
                  class="accordion-collapse collapse"
                  :data-bs-parent="`#${accordionId}`"
                >
                  <div class="accordion-body p-3">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="text-muted small">Obra Social</label>
                        <p class="fw-bold">{{ userData.obraSocial || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Plan</label>
                        <p class="fw-bold">{{ userData.obraSocial_Plan || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">ID Obra Social</label>
                        <p class="fw-bold">{{ userData.obraSocial_id || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Carnet</label>
                        <p class="fw-bold">{{ userData.obraSocial_Carnet || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Dieta</label>
                        <p class="fw-bold">{{ userData.med_dieta || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Tipo de Sangre</label>
                        <p class="fw-bold">{{ userData.med_sangre || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Historia Médica</label>
                        <p class="fw-bold">{{ userData.med_historia || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Problemas de Salud</label>
                        <p class="fw-bold">{{ userData.med_problemas || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Actividad Física</label>
                        <p class="fw-bold">{{ userData.med_act || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Lesiones Actuales</label>
                        <p class="fw-bold">{{ userData.med_actLesion || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Foto DNI</label>
                        <p class="fw-bold">{{ userData.foto_dni || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Foto Rostro</label>
                        <p class="fw-bold">{{ userData.foto_rostro || '-' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 5. Organización -->
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    :data-bs-target="`#organizacion-${accordionId}`"
                  >
                    <i class="bi bi-building me-2"></i> Organización
                  </button>
                </h2>
                <div
                  :id="`organizacion-${accordionId}`"
                  class="accordion-collapse collapse"
                  :data-bs-parent="`#${accordionId}`"
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
                      <div class="col-md-6">
                        <label class="text-muted small">Apodo CBok</label>
                        <p class="fw-bold">{{ userData.apodoCBok || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">¿Activo?</label>
                        <p class="fw-bold">{{ userData.activo ? 'Sí' : 'No' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Nivel</label>
                        <p class="fw-bold">{{ userData.nivel || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Nivel HBTJ</label>
                        <p class="fw-bold">{{ userData.nivelHBTJ || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Fecha de Ingreso Org</label>
                        <p class="fw-bold">{{ userData.fecha_ingresoOrg || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Fecha de Ingreso Milu</label>
                        <p class="fw-bold">{{ userData.fecha_ingresoMilu || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Áreas Históricas</label>
                        <p class="fw-bold">{{ userData.areas_historicas || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Curso TL</label>
                        <p class="fw-bold">{{ userData.curso_TL || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Curso Av H</label>
                        <p class="fw-bold">{{ userData.curso_AvH || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Curso Av KM</label>
                        <p class="fw-bold">{{ userData.curso_AvKM || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Curso IE</label>
                        <p class="fw-bold">{{ userData.curso_IE || '-' }}</p>
                      </div>
                      <div class="col-md-6">
                        <label class="text-muted small">Curso FND</label>
                        <p class="fw-bold">{{ userData.curso_FND || '-' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 6. Vida y Desarrollo -->
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    :data-bs-target="`#desarrollo-${accordionId}`"
                  >
                    <i class="bi bi-book me-2"></i> Vida y Desarrollo
                  </button>
                </h2>
                <div
                  :id="`desarrollo-${accordionId}`"
                  class="accordion-collapse collapse"
                  :data-bs-parent="`#${accordionId}`"
                >
                  <div class="accordion-body p-3">
                    <p class="text-muted"><small>No hay datos en esta sección</small></p>
                  </div>
                </div>
              </div>

              <!-- 7. Familia -->
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    :data-bs-target="`#familia-${accordionId}`"
                  >
                    <i class="bi bi-people me-2"></i> Familia
                  </button>
                </h2>
                <div
                  :id="`familia-${accordionId}`"
                  class="accordion-collapse collapse"
                  :data-bs-parent="`#${accordionId}`"
                >
                  <div class="accordion-body p-3">
                    <p class="text-muted"><small>No hay datos en esta sección</small></p>
                  </div>
                </div>
              </div>

              <!-- 8. Técnicos (Solo visible para nivel 3) -->
              <div v-if="canSeeTechnical" class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    :data-bs-target="`#tecnicos-${accordionId}`"
                  >
                    <i class="bi bi-gear me-2"></i> Técnicos
                  </button>
                </h2>
                <div
                  :id="`tecnicos-${accordionId}`"
                  class="accordion-collapse collapse"
                  :data-bs-parent="`#${accordionId}`"
                >
                  <div class="accordion-body p-3">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="text-muted small">Nivel IT</label>
                        <p class="fw-bold">
                          <span :class="getLevelBadgeClass(userData.it_level)">
                            {{ getLevelName(userData.it_level) }}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="card-footer d-flex gap-2">
            <button @click="openEditForm" class="btn btn-primary" :disabled="loading || !canEdit">
              <i class="bi bi-pencil"></i> Editar Datos
            </button>
            <!-- Eliminar usuario: deshabilitado por ahora, lógica backend en handleDelete() -->
            <!-- <button v-if="can(3)" class="btn btn-danger" :disabled="loading" @click="handleDelete">
              <i class="bi bi-trash"></i> Eliminar
            </button> -->
            <div v-if="!canEdit" class="ms-auto">
              <span class="badge bg-warning">Solo lectura</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel lateral de información -->
      <div class="col-md-4">
        <div class="card shadow-sm bg-light mb-3">
          <div class="card-header bg-info text-white">
            <h6 class="mb-0"><i class="bi bi-shield-check"></i> Permisos</h6>
          </div>
          <div class="card-body small">
            <p class="mb-2">
              <i v-if="canEdit" class="bi bi-check-circle text-success"></i>
              <i v-else class="bi bi-x-circle text-danger"></i>
              Editar datos
            </p>
            <p class="mb-0">
              <i v-if="canSeeTechnical" class="bi bi-check-circle text-success"></i>
              <i v-else class="bi bi-x-circle text-danger"></i>
              Ver datos técnicos
            </p>
            <!-- Eliminar usuarios: funcionalidad deshabilitada por ahora -->
          </div>
        </div>

        <div class="card shadow-sm bg-light">
          <div class="card-header bg-warning text-dark">
            <h6 class="mb-0"><i class="bi bi-info-circle"></i> Nivel del Usuario</h6>
          </div>
          <div class="card-body small">
            <p class="fw-bold mb-2">
              <span :class="getLevelBadgeClass(userData.it_level)">
                {{ getLevelName(userData.it_level) }}
              </span>
            </p>
            <p class="mb-0">{{ getLevelDescription(userData.it_level) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Componente de formulario (offcanvas) -->
    <ProfileForm
      ref="profileForm"
      :profileData="userData"
      :isEditing="true"
      :canEditSection="canEditSection"
      :canSeeTechnical="canSeeTechnical"
      @update="onUserUpdated"
      @close="onFormClosed"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/composables/usePermissions'
import { getAll, remove } from '@/services/api'
import ProfileForm from '@/components/ProfileForm.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { can, canEditSection, canSeeTechnical, canAccessUser, getLevelName } = usePermissions()

const profileForm = ref(null)
const userData = ref({})
const loading = ref(true)
const notFound = ref(false)
const noPermission = ref(false)
const accordionId = 'userAccordion'

// Computed: verificar si puede editar
const canEdit = computed(() => {
  if (!authStore.user) return false
  const userLevel = authStore.user.it_level ?? 0
  const targetDni = parseInt(route.params.dni)

  // Nivel 3: acceso total
  if (userLevel === 3) return true

  // Nivel 1: solo su propio perfil
  if (userLevel === 1) return authStore.user.dni === targetDni

  // Nivel 2: su propio perfil + usuarios que comparten MISMA organización
  if (userLevel === 2) {
    if (authStore.user.dni === targetDni) return true
    if (userData.value && authStore.user.organizacion) {
      // Verificar que sean de la misma organización
      const sameOrganization = authStore.user.organizacion === userData.value.organizacion
      if (!sameOrganization) return false

      // CASO ESPECIAL: Si el usuario tiene "ROSH" en areas_ref, puede editar a TODOS de su organización
      if (authStore.user.areas_ref && authStore.user.areas_ref.includes('ROSH')) {
        return true
      }

      // CASO NORMAL: Verificar que compartan al menos una área
      if (authStore.user.areas_ref && userData.value.areas_ref) {
        const shareAreas = (areas1, areas2) => {
          if (!areas1 || !areas2) return false
          const areasArray1 = areas1.split(',').map((a) => a.trim())
          const areasArray2 = areas2.split(',').map((a) => a.trim())
          return areasArray1.some((area) => areasArray2.includes(area))
        }
        return shareAreas(authStore.user.areas_ref, userData.value.areas_ref)
      }
    }
  }

  return false
})

onMounted(async () => {
  // Verificar que sea nivel 1+
  if (!authStore.user || authStore.user.it_level < 1) {
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

    // Verificar permisos de acceso (se usa areas_ref del mainRecord)
    if (!canAccessUser(dni, mainRecord)) {
      noPermission.value = true
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
      obraSocial_Carnet: mainRecord?.obraSocial_Carnet || '',
      med_dieta: mainRecord?.med_dieta || '',
      med_sangre: mainRecord?.med_sangre || '',
      med_historia: mainRecord?.med_historia || '',
      med_problemas: mainRecord?.med_problemas || '',
      med_act: mainRecord?.med_act || '',
      med_actLesion: mainRecord?.med_actLesion || '',
      med_estudios: mainRecord?.med_estudios || '',
      med_estudios_lab: mainRecord?.med_estudios_lab || '',
      med_estudios_ergo: mainRecord?.med_estudios_ergo || '',
      med_estudios_ecodoppler: mainRecord?.med_estudios_ecodoppler || '',
      med_estudios_rx: mainRecord?.med_estudios_rx || '',
      med_estudios_extras: mainRecord?.med_estudios_extras || '',
      med_estudios_extraMotivo: mainRecord?.med_estudios_extraMotivo || '',
      med_estudios_certificado: mainRecord?.med_estudios_certificado || '',
      med_estudios_fechaEst: mainRecord?.med_estudios_fechaEst || '',
      med_aclararimg: mainRecord?.med_aclararimg || '',
      med_estudios_img1: mainRecord?.med_estudios_img1 || '',
      med_estudios_img2: mainRecord?.med_estudios_img2 || '',
      med_estudios_img3: mainRecord?.med_estudios_img3 || '',
      med_estudios_otro: mainRecord?.med_estudios_otro || '',
      organizacion: mainRecord?.organizacion || '',
      areas: mainRecord?.areas || '',
      areas_ref: mainRecord?.areas_ref || '',
      apodoCBok: mainRecord?.apodoCBok || '',
      activo: mainRecord?.activo || false,
      nivel: mainRecord?.nivel || '',
      nivelHBTJ: mainRecord?.nivelHBTJ || '',
      fecha_ingresoOrg: mainRecord?.fecha_ingresoOrg || '',
      fecha_ingresoMilu: mainRecord?.fecha_ingresoMilu || '',
      areas_historicas: mainRecord?.areas_historicas || '',
      curso_TL: mainRecord?.curso_TL || '',
      curso_AvH: mainRecord?.curso_AvH || '',
      curso_AvKM: mainRecord?.curso_AvKM || '',
      curso_IE: mainRecord?.curso_IE || '',
      curso_FND: mainRecord?.curso_FND || '',
      it_level: userRecord?.it_level || 0,
    }
  } catch (error) {
    console.error('Error loading user data:', error)
    notFound.value = true
  } finally {
    loading.value = false
  }
}

const openEditForm = () => {
  if (canEdit.value) {
    profileForm.value.open()
  }
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

const getLevelDescription = (level) => {
  const descriptions = {
    0: 'Sin acceso - No puede realizar operaciones',
    1: 'Básico - Solo ve su propio perfil. Edita: personal, contacto, domicilio, médicos, desarrollo, familia',
    2: 'Intermedio - Ve usuarios de sus áreas. Edita: personal, contacto, domicilio, médicos, desarrollo, familia, organización',
    3: 'Avanzado - Acceso total a todos los usuarios, incluyendo datos técnicos',
  }
  return descriptions[level] || 'Nivel desconocido'
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
