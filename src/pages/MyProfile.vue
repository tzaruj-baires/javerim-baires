<template>
  <div class="container mt-4">
    <!-- Encabezado -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <h2><i class="bi bi-person-circle"></i> Mi Perfil</h2>
          <router-link to="/" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left"></i> Volver
          </router-link>
        </div>
      </div>
    </div>

    <!-- Tarjeta de perfil -->
    <div class="row">
      <div class="col-md-8">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0"><i class="bi bi-person-vcard"></i> Información Personal</h5>
          </div>

          <div class="card-body">
            <!-- Cargando -->
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
            </div>

            <!-- Datos cargados -->
            <div v-else-if="profileData" class="row g-3">
              <div class="col-md-6">
                <div class="profile-item">
                  <label class="text-muted small">DNI</label>
                  <p class="fw-bold">{{ profileData.dni || profileData.DNI }}</p>
                </div>
              </div>

              <div class="col-md-6">
                <div class="profile-item">
                  <label class="text-muted small">Nombre</label>
                  <p class="fw-bold">{{ profileData.nombre }} {{ profileData.apellido }}</p>
                </div>
              </div>

              <div class="col-md-6">
                <div class="profile-item">
                  <label class="text-muted small">Apodo</label>
                  <p class="fw-bold">{{ profileData.apodo || authStore.user.nickname }}</p>
                </div>
              </div>

              <div class="col-md-6">
                <div class="profile-item">
                  <label class="text-muted small">Email</label>
                  <p class="fw-bold text-break">{{ profileData.email || profileData.mail_operativo || profileData.mail_personal || '-' }}</p>
                </div>
              </div>

              <div class="col-md-6">
                <div class="profile-item">
                  <label class="text-muted small">Teléfono</label>
                  <p class="fw-bold">{{ profileData.celular || profileData.cellphone || '-' }}</p>
                </div>
              </div>

              <div class="col-md-6">
                <div class="profile-item">
                  <label class="text-muted small">Organización</label>
                  <p class="fw-bold">{{ profileData.organizacion || '-' }}</p>
                </div>
              </div>

              <div class="col-md-6">
                <div class="profile-item">
                  <label class="text-muted small">Nivel IT</label>
                  <p class="fw-bold">
                    <span class="badge bg-success">{{ getLevelName(authStore.user.it_level) }}</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Error -->
            <div v-else class="alert alert-warning">
              <i class="bi bi-exclamation-triangle"></i> No se encontraron datos del perfil
            </div>
          </div>

          <!-- Botón de editar -->
          <div class="card-footer d-flex gap-2">
            <button 
              @click="openEditForm" 
              class="btn btn-primary"
            >
              <i class="bi bi-pencil"></i> Editar Perfil
            </button>
          </div>
        </div>
      </div>

      <!-- Tarjeta lateral: Resumen -->
      <div class="col-md-4">
        <div class="card shadow-sm bg-light">
          <div class="card-header bg-info text-white">
            <h6 class="mb-0"><i class="bi bi-info-circle"></i> Resumen</h6>
          </div>
          <div class="card-body">
            <p class="small text-muted mb-2">
              <strong>Última actualización:</strong><br>
              {{ lastUpdated || 'No disponible' }}
            </p>
            <hr>
            <p class="small">
              <i class="bi bi-shield-check"></i> 
              Tu perfil está <strong>completo</strong> y <strong>verificado</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Componente de formulario (offcanvas) -->
    <ProfileForm 
      ref="profileForm"
      :profileData="profileData"
      :isEditing="true"
      :showOrgField="true"
      @update="onProfileUpdated"
      @close="onFormClosed"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/composables/usePermissions'
import { getAll } from '@/services/api'
import ProfileForm from '@/components/ProfileForm.vue'

const router = useRouter()
const authStore = useAuthStore()
const { getLevelName } = usePermissions()

const profileForm = ref(null)
const profileData = ref({})
const loading = ref(true)
const lastUpdated = ref(null)

onMounted(async () => {
  // Verificar que sea nivel 1+
  if (!authStore.user || authStore.user.it_level < 1) {
    router.push('/')
    return
  }

  await loadProfile()
})

const loadProfile = async () => {
  try {
    loading.value = true

    // Obtener datos de main usando el DNI del usuario
    const response = await getAll('main')
    const mainData = response.data

    // Buscar el registro que coincida con el DNI del usuario
    const userRecord = mainData.find(record => record.DNI === authStore.user.dni)

    if (userRecord) {
      profileData.value = userRecord
      // Intentar obtener fecha de actualización si existe
      lastUpdated.value = userRecord.fecha_actualizacion || new Date().toLocaleDateString('es-AR')
    } else {
      profileData.value = {
        DNI: authStore.user.dni,
        nombre: '',
        apellido: '',
        mail_operativo: authStore.user.email,
        celular: authStore.user.cellphone,
        organizacion: '',
        apodo: authStore.user.nickname
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error)
    profileData.value = {
      DNI: authStore.user.dni,
      nombre: '',
      apellido: '',
      mail_operativo: authStore.user.email,
      celular: authStore.user.cellphone,
      organizacion: '',
      apodo: authStore.user.nickname
    }
  } finally {
    loading.value = false
  }
}

const openEditForm = () => {
  profileForm.value.open()
}

const onProfileUpdated = () => {
  // Recargar datos después de actualización
  loadProfile()
}

const onFormClosed = () => {
  // Formulario cerrado
}
</script>

<style scoped>
.profile-item {
  padding: 0.5rem 0;
}

.profile-item label {
  display: block;
  margin-bottom: 0.25rem;
}

.profile-item p {
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
