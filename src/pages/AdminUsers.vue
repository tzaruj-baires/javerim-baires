<template>
  <div class="container-fluid mt-4">
    <!-- Bienvenida -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm bg-gradient-warning text-dark">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h2 class="mb-0"><i class="bi bi-shield-lock"></i> Administración de Usuarios</h2>
            </div>
            <button @click="refreshUsers" class="btn btn-warning" :disabled="loading">
              <i class="bi bi-arrow-clockwise"></i> Actualizar
            </button>
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

    <!-- Configuración de emails para notificación -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0"><i class="bi bi-envelope"></i> Configuración de Notificaciones</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label for="notificationEmails" class="form-label">
                Correos para notificaciones de nuevos registros
              </label>
              <textarea
                v-model="notificationEmails"
                id="notificationEmails"
                class="form-control"
                rows="3"
                placeholder="correo1@ejemplo.com&#10;correo2@ejemplo.com&#10;correo3@ejemplo.com"
                @change="saveNotificationEmails"
              ></textarea>
              <small class="text-muted">Ingresa un correo por línea</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-2"><i class="bi bi-people"></i> Usuarios Registrados</h5>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control form-control-sm"
              placeholder="Buscar por email, DNI o nickname..."
            />
          </div>

          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover table-striped align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th @click="sortBy('dni')" class="cursor-pointer">
                      DNI {{ getSortIndicator('dni') }}
                    </th>
                    <th @click="sortBy('nickname')" class="cursor-pointer">
                      Nickname {{ getSortIndicator('nickname') }}
                    </th>
                    <th @click="sortBy('email')" class="cursor-pointer">
                      Email {{ getSortIndicator('email') }}
                    </th>
                    <th @click="sortBy('cellphone')" class="cursor-pointer">
                      Teléfono {{ getSortIndicator('cellphone') }}
                    </th>
                    <th @click="sortBy('it_level')" class="cursor-pointer">
                      Nivel {{ getSortIndicator('it_level') }}
                    </th>
                    <th class="text-center">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-if="loading">
                    <td colspan="6" class="text-center py-4">
                      <span class="spinner-border spinner-border-sm me-2"></span> Cargando...
                    </td>
                  </tr>

                  <tr v-else-if="filteredUsers.length === 0">
                    <td colspan="6" class="text-center py-4 text-muted">No hay usuarios</td>
                  </tr>

                  <tr v-else v-for="user in paginatedUsers" :key="user.id">
                    <td>
                      <small
                        ><strong>{{ user.dni }}</strong></small
                      >
                    </td>
                    <td>{{ user.nickname }}</td>
                    <td>
                      <small>{{ user.email }}</small>
                    </td>
                    <td>
                      <small>
                        <a :href="`https://wa.me/${user.cellphone}`" v-if="user.cellphone">
                          {{ user.cellphone }}
                        </a>
                        <span v-else>-</span>
                      </small>
                    </td>
                    <td>
                      <span
                        :class="{
                          'badge bg-danger': user.it_level === 0,
                          'badge bg-info': user.it_level === 1,
                          'badge bg-success': user.it_level === 2,
                          'badge bg-warning text-dark': user.it_level === 3,
                        }"
                      >
                        {{ getLevelName(user.it_level) }}
                      </span>
                    </td>
                    <td class="text-center">
                      <!-- Otorgar acceso -->
                      <div class="btn-group btn-group-sm" role="group">
                        <button
                          @click="openGrantAccessModal(user)"
                          class="btn btn-outline-success"
                          title="Otorgar acceso"
                        >
                          <i class="bi bi-check-circle"></i>
                        </button>

                        <!-- Eliminar usuario -->
                        <!--
                        <button
                          @click="deleteUser(user.id)"
                          class="btn btn-outline-danger"
                          title="Eliminar usuario"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                        -->
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
              Mostrando {{ paginatedUsers.length }} de {{ filteredUsers.length }} usuarios
            </small>
            <div>
              <button
                v-if="displayedCount < filteredUsers.length"
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

    <!-- Modal para otorgar acceso -->
    <div
      v-if="showGrantAccessModal"
      class="modal d-block"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Otorgar Acceso - {{ selectedUser?.email }}</h5>
            <button type="button" class="btn-close" @click="showGrantAccessModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="levelSelect" class="form-label">Selecciona el nivel de acceso:</label>
              <select v-model.number="selectedLevel" id="levelSelect" class="form-select">
                <option :value="0">Sin acceso (0)</option>
                <option :value="1">Usuario Básico (1)</option>
                <option :value="2">Usuario Avanzado (2)</option>
                <option :value="3">Administrador (3)</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showGrantAccessModal = false">
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="grantAccess"
              :disabled="updatingUser"
            >
              <span v-if="!updatingUser">Actualizar</span>
              <span v-else>
                <span
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Actualizando...
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
import { getAll, update, remove } from '@/services/api'
import { usePermissions } from '@/composables/usePermissions'
import { sendAccessLevelNotification } from '@/stores/auth'

const { getLevelName } = usePermissions()

const users = ref([])
const loading = ref(true)
const searchQuery = ref('')
const displayedCount = ref(10)
const itemsPerPage = 10
const sortKey = ref('')
const sortOrder = ref('asc')
const successMessage = ref('')
const errorMessage = ref('')
const showGrantAccessModal = ref(false)
const selectedUser = ref(null)
const selectedLevel = ref(0)
const updatingUser = ref(false)
const notificationEmails = ref('')

const loadUsers = async () => {
  loading.value = true
  try {
    const res = await getAll('users')
    users.value = res.data || []
  } catch (err) {
    console.error('Error cargando usuarios', err)
    errorMessage.value = 'Error al cargar los usuarios'
  } finally {
    loading.value = false
  }
}

const loadNotificationEmails = () => {
  const stored = localStorage.getItem('notificationEmails')
  if (stored) {
    notificationEmails.value = stored
  }
}

const saveNotificationEmails = () => {
  localStorage.setItem('notificationEmails', notificationEmails.value)
  successMessage.value = 'Correos de notificación guardados'
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

const normalizeText = (text = '') =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const filteredUsers = computed(() => {
  let filtered = users.value.filter((user) => user.email && user.dni)

  if (!searchQuery.value.trim()) {
    return filtered
  }

  const query = normalizeText(searchQuery.value)

  return filtered.filter((user) => {
    return (
      normalizeText(user.dni).includes(query) ||
      normalizeText(user.nickname).includes(query) ||
      normalizeText(user.email).includes(query)
    )
  })
})

const sortedAndPaginated = computed(() => {
  let sorted = [...filteredUsers.value]

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

const paginatedUsers = sortedAndPaginated

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

const refreshUsers = () => {
  loadUsers()
}

const openGrantAccessModal = (user) => {
  selectedUser.value = user
  selectedLevel.value = user.it_level
  showGrantAccessModal.value = true
}

const grantAccess = async () => {
  try {
    updatingUser.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const updateData = {
      id: selectedUser.value.id,
      it_level: selectedLevel.value,
    }
    console.log('Datos a enviar:', updateData)

    await update('users', updateData)

    // Actualizar en la lista local
    const userIndex = users.value.findIndex((u) => u.id === selectedUser.value.id)
    if (userIndex !== -1) {
      users.value[userIndex].it_level = selectedLevel.value
    }

    // Enviar notificación al usuario sobre el cambio de nivel
    const levelNames = {
      0: 'Sin acceso',
      1: 'Usuario Básico',
      2: 'Usuario Avanzado',
      3: 'Administrador',
    }
    await sendAccessLevelNotification(selectedUser.value, selectedLevel.value, levelNames)

    successMessage.value = `Acceso actualizado a ${getLevelName(selectedLevel.value)} - Notificación enviada`
    showGrantAccessModal.value = false
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err) {
    console.error('Error actualizando acceso:', err)
    errorMessage.value = 'Error al actualizar el acceso del usuario'
  } finally {
    updatingUser.value = false
  }
}

const deleteUser = async (userId) => {
  if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
    return
  }

  try {
    errorMessage.value = ''
    successMessage.value = ''
    await remove('users', userId)

    users.value = users.value.filter((u) => u.id !== userId)
    successMessage.value = 'Usuario eliminado correctamente'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err) {
    console.error('Error eliminando usuario:', err)
    errorMessage.value = 'Error al eliminar el usuario'
  }
}

onMounted(() => {
  loadUsers()
  loadNotificationEmails()
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  user-select: none;
}

.cursor-pointer:hover {
  background-color: #f5f5f5;
}

.modal.d-block {
  display: block !important;
}

.badge {
  font-size: 0.85rem;
  padding: 0.5rem 0.75rem;
}

.btn-group-sm > .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.bg-gradient-warning {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
}
</style>
