<template>
  <div class="jv-page">
    <!-- ── Header ── -->
    <div class="jv-page-header">
      <div class="jv-page-header__left">
        <div class="jv-page-header__icon jv-page-header__icon--amber">
          <i class="bi bi-shield-lock"></i>
        </div>
        <div>
          <p class="jv-page-header__eyebrow">Panel de administración</p>
          <h1 class="jv-page-header__title">Usuarios</h1>
        </div>
      </div>
      <button class="jv-btn jv-btn--ghost" @click="refreshUsers" :disabled="loading">
        <i class="bi bi-arrow-clockwise" :class="{ 'au-spin': loading }"></i>
        <span class="jv-btn__label">Actualizar</span>
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
      <button class="jv-alert__close" @click="errorMessage = ''"><i class="bi bi-x-lg"></i></button>
    </div>

    <!-- ── Tabla de usuarios ── -->
    <div class="jv-table-panel">
      <div class="jv-table-panel__header">
        <div class="jv-table-panel__title-row">
          <i class="bi bi-people"></i>
          <h2 class="jv-table-panel__title">Usuarios Registrados</h2>
          <span class="jv-table-panel__count" v-if="!loading">{{ filteredUsers.length }}</span>
        </div>
        <div class="jv-search">
          <i class="bi bi-search jv-search__icon"></i>
          <input
            v-model="searchQuery"
            type="text"
            class="jv-search__input"
            placeholder="Buscar por email, DNI o nickname..."
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
              <th class="sortable" @click="sortBy('dni')">
                DNI <span class="au-sort">{{ getSortIndicator('dni') }}</span>
              </th>
              <th class="sortable" @click="sortBy('nickname')">
                Nickname <span class="au-sort">{{ getSortIndicator('nickname') }}</span>
              </th>
              <th class="sortable" @click="sortBy('email')">
                Email <span class="au-sort">{{ getSortIndicator('email') }}</span>
              </th>
              <th class="sortable jv-hide-sm" @click="sortBy('cellphone')">
                Teléfono <span class="au-sort">{{ getSortIndicator('cellphone') }}</span>
              </th>
              <th class="sortable" @click="sortBy('it_level')">
                Nivel <span class="au-sort">{{ getSortIndicator('it_level') }}</span>
              </th>
              <th class="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6">
                <div class="jv-loading-row">
                  <span class="jv-spinner"></span> Cargando usuarios...
                </div>
              </td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0">
              <td colspan="6" class="jv-table__empty">
                <i class="bi bi-inbox"></i>
                No hay usuarios
              </td>
            </tr>
            <tr v-else v-for="user in paginatedUsers" :key="user.id">
              <td>
                <span class="jv-mono">{{ user.dni }}</span>
              </td>
              <td>{{ user.nickname }}</td>
              <td>
                <a :href="`mailto:${user.email}`" class="jv-link" v-if="user.email">{{
                  user.email
                }}</a>
                <span v-else>—</span>
              </td>
              <td class="jv-hide-sm">
                <a
                  :href="`https://wa.me/${user.cellphone}`"
                  class="jv-link jv-link--phone"
                  v-if="user.cellphone"
                  target="_blank"
                >
                  <i class="bi bi-whatsapp"></i> {{ user.cellphone }}
                </a>
                <span v-else>—</span>
              </td>
              <td>
                <span :class="levelBadgeClass(user.it_level)" class="jv-badge">
                  {{ getLevelName(user.it_level) }}
                </span>
              </td>
              <td class="center">
                <button
                  @click="openGrantAccessModal(user)"
                  class="jv-action-btn jv-action-btn--grant"
                  title="Otorgar acceso"
                >
                  <i class="bi bi-check-circle"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="jv-table-footer">
        <span class="jv-table-footer__info">
          Mostrando <strong>{{ paginatedUsers.length }}</strong> de
          <strong>{{ filteredUsers.length }}</strong> usuarios
        </span>
        <div class="jv-table-footer__actions">
          <button
            v-if="displayedCount < filteredUsers.length"
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

    <!-- ── Modal otorgar acceso ── -->
    <div
      v-if="showGrantAccessModal"
      class="jv-modal-backdrop"
      @click.self="showGrantAccessModal = false"
    >
      <div class="jv-modal jv-modal--sm">
        <div class="jv-modal__header">
          <h3 class="jv-modal__title"><i class="bi bi-shield-check"></i> Otorgar Acceso</h3>
          <button class="jv-modal__close" @click="showGrantAccessModal = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="jv-modal__body">
          <p class="au-modal-user">
            <i class="bi bi-person-circle"></i>
            {{ selectedUser?.email }}
          </p>
          <div class="jv-field">
            <label class="jv-label" for="levelSelect">Nivel de acceso</label>
            <select v-model.number="selectedLevel" id="levelSelect" class="jv-input jv-select">
              <option :value="0">Sin acceso (0)</option>
              <option :value="1">Usuario Básico (1)</option>
              <option :value="2">Usuario Avanzado (2)</option>
              <option :value="3">Administrador (3)</option>
            </select>
          </div>
          <!-- Preview del nivel -->
          <div class="au-level-preview">
            <span :class="levelBadgeClass(selectedLevel)" class="jv-badge">
              {{ getLevelName(selectedLevel) }}
            </span>
          </div>
        </div>
        <div class="jv-modal__footer">
          <button class="jv-btn jv-btn--ghost" @click="showGrantAccessModal = false">
            Cancelar
          </button>
          <button class="jv-btn jv-btn--primary" @click="grantAccess" :disabled="updatingUser">
            <span v-if="!updatingUser"><i class="bi bi-check-circle"></i> Actualizar</span>
            <span v-else class="au-loading-text">
              <span class="jv-spinner jv-spinner--sm jv-spinner--white"></span>
              Actualizando...
            </span>
          </button>
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

const levelBadgeClass = (level) => ({
  'jv-badge--level-0': level === 0,
  'jv-badge--level-1': level === 1,
  'jv-badge--level-2': level === 2,
  'jv-badge--level-3': level === 3,
})

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

    const userIndex = users.value.findIndex((u) => u.id === selectedUser.value.id)
    if (userIndex !== -1) {
      users.value[userIndex].it_level = selectedLevel.value
    }

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
/* Solo estilos que no están en javerim.css */
.au-sort {
  opacity: 0.55;
  font-size: 0.65rem;
}

@keyframes au-spin-anim {
  to {
    transform: rotate(360deg);
  }
}
.au-spin {
  animation: au-spin-anim 0.8s linear infinite;
  display: inline-block;
}

.au-modal-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid var(--jv-border);
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1rem;
  color: var(--jv-text);
  word-break: break-all;
}

.au-modal-user i {
  color: var(--jv-accent);
  flex-shrink: 0;
}

.au-level-preview {
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--jv-text-muted);
}

.au-level-preview::before {
  content: 'Nuevo nivel:';
}

.au-loading-text {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
</style>
