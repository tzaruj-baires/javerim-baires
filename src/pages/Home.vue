<template>
  <div class="container-fluid mt-4">
    <!-- Bienvenida y datos del usuario -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm bg-gradient-info text-white">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h2 class="mb-0">
                <i class="bi bi-house"></i> Hola,
                {{ authStore.user?.nickname || authStore.user?.email }}!
              </h2>
            </div>
            <router-link v-if="can(1)" to="/mi-perfil" class="btn btn-light">
              <i class="bi bi-person-circle"></i> Mi Perfil
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje de acceso restringido para nivel 0 -->
    <div v-if="authStore.user?.it_level === 0" class="row mb-4">
      <div class="col-12">
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
          <h5 class="alert-heading">
            <i class="bi bi-exclamation-triangle"></i> Acceso Restringido
          </h5>
          <p class="mb-0">
            Tu cuenta ha sido creada correctamente, pero requiere aprobación del administrador para
            acceder a las funcionalidades.
            <strong>Contacta con el administrador</strong> para que asigne tu nivel de acceso.
          </p>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
          ></button>
        </div>
      </div>
    </div>

    <!-- Tabla de usuarios (visible para nivel 1+) -->
    <div class="row mb-4" v-if="can(1)">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-2"><i class="bi bi-people"></i> Usuarios</h5>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control form-control-sm"
              placeholder="Buscar en todos los campos..."
            />
          </div>

          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover table-striped align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th @click="sortBy('DNI')" class="cursor-pointer">
                      DNI {{ getSortIndicator('DNI') }}
                    </th>
                    <th @click="sortBy('nombre')" class="cursor-pointer">
                      Nombre {{ getSortIndicator('nombre') }}
                    </th>
                    <th @click="sortBy('apodo')" class="cursor-pointer">
                      Apodo {{ getSortIndicator('apodo') }}
                    </th>
                    <th @click="sortBy('organizacion')" class="cursor-pointer">
                      Org. {{ getSortIndicator('organizacion') }}
                    </th>
                    <th @click="sortBy('areas')" class="cursor-pointer">
                      Áreas {{ getSortIndicator('areas') }}
                    </th>
                    <th @click="sortBy('celular')" class="cursor-pointer">
                      Celular {{ getSortIndicator('celular') }}
                    </th>
                    <th @click="sortBy('mail')" class="cursor-pointer">
                      E-Mail {{ getSortIndicator('mail') }}
                    </th>
                    <th class="text-center">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-if="loading">
                    <td colspan="8" class="text-center py-4">
                      <span class="spinner-border spinner-border-sm me-2"></span> Cargando...
                    </td>
                  </tr>

                  <tr v-else-if="filteredUsers.length === 0">
                    <td colspan="8" class="text-center py-4 text-muted">No hay usuarios</td>
                  </tr>

                  <tr v-else v-for="user in paginatedUsers" :key="user.id">
                    <td>
                      <small>{{ user.DNI }}</small>
                    </td>
                    <td>{{ user.nombre }} {{ user.apellido }}</td>
                    <td>{{ user.apodo }}</td>
                    <td>{{ user.organizacion }}</td>
                    <td>
                      <small>{{ user.areas || '-' }}</small>
                    </td>
                    <td>
                      <small
                        ><a :href="`https://wa.me/${user.celular}`" v-if="user.celular !== ''">
                          {{ user.celular }}</a
                        >
                        <span v-else>-</span></small
                      >
                    </td>
                    <td>
                      <small>
                        <a
                          :href="`mailto:${user.mail_operativo || user.mail_personal}`"
                          v-if="user.mail_operativo !== '' || user.mail_personal !== ''"
                          >{{ user.mail_operativo || user.mail_personal }}</a
                        >
                        <span v-else>-</span></small
                      >
                    </td>
                    <td class="text-center">
                      <router-link
                        :to="`/javer/${user.DNI}`"
                        class="btn btn-sm btn-outline-primary"
                        title="Editar"
                      >
                        <i class="bi bi-pencil"></i>
                      </router-link>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAll } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/composables/usePermissions'

const authStore = useAuthStore()
const { can } = usePermissions()

const users = ref([])
const loading = ref(true)
const searchQuery = ref('')
const displayedCount = ref(10)
const itemsPerPage = 10
const sortKey = ref('')
const sortOrder = ref('asc')

/* =========================
   CARGA DE USUARIOS
========================= */
const loadUsers = async () => {
  loading.value = true
  try {
    const res = await getAll('main')
    users.value = res.data
  } catch (err) {
    console.error('Error cargando usuarios', err)
  } finally {
    loading.value = false
  }
}

/* =========================
   HELPERS
========================= */
const normalizeText = (text = '') =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const hasValue = (val) => val !== null && val !== undefined && val !== ''

const getNombreCompleto = (u) => normalizeText(`${u.nombre || ''} ${u.apellido || ''}`)

const getOrg = (u) => normalizeText(u.organizacion || '')

const compareStrings = (a, b, order) => {
  if (a < b) return order === 'asc' ? -1 : 1
  if (a > b) return order === 'asc' ? 1 : -1
  return 0
}

/* =========================
   FILTRADO
========================= */
const filteredUsers = computed(() => {
  let filtered = users.value.filter((user) => {
    const mail = user.mail_operativo || user.mail_personal || ''
    return !(
      !user.DNI &&
      !user.nombre &&
      !user.apellido &&
      !user.apodo &&
      !user.organizacion &&
      !mail
    )
  })

  if (!searchQuery.value.trim()) return filtered

  const query = normalizeText(searchQuery.value)

  return filtered.filter((user) => {
    const mail = user.mail_operativo || user.mail_personal || ''
    return (
      normalizeText(user.DNI).includes(query) ||
      normalizeText(`${user.nombre} ${user.apellido}`).includes(query) ||
      normalizeText(user.apodo).includes(query) ||
      normalizeText(user.organizacion).includes(query) ||
      normalizeText(mail).includes(query)
    )
  })
})

/* =========================
   COMPARATORS
========================= */
const getComparator = (key) => {
  return (a, b) => {
    const order = sortOrder.value

    // 🔢 DNI (numérico puro)
    if (key === 'DNI') {
      return order === 'asc' ? Number(a.DNI) - Number(b.DNI) : Number(b.DNI) - Number(a.DNI)
    }

    // 🔤 Apodo / Áreas
    if (key === 'apodo' || key === 'areas') {
      // 1. Organización
      const orgCompare = compareStrings(getOrg(a), getOrg(b), order)
      if (orgCompare !== 0) return orgCompare

      const aVal = normalizeText(a[key] || '')
      const bVal = normalizeText(b[key] || '')

      // 2. Con valor primero
      if (hasValue(aVal) && !hasValue(bVal)) return -1
      if (!hasValue(aVal) && hasValue(bVal)) return 1

      // 3. Valor
      const valCompare = compareStrings(aVal, bVal, order)
      if (valCompare !== 0) return valCompare

      // 4. Nombre
      return compareStrings(getNombreCompleto(a), getNombreCompleto(b), order)
    }

    // 📞 Celular / Mail
    if (key === 'celular' || key === 'mail') {
      // 1. Organización
      const orgCompare = compareStrings(getOrg(a), getOrg(b), order)
      if (orgCompare !== 0) return orgCompare

      const aVal = normalizeText(
        key === 'mail' ? a.mail_operativo || a.mail_personal || '' : a.celular || '',
      )

      const bVal = normalizeText(
        key === 'mail' ? b.mail_operativo || b.mail_personal || '' : b.celular || '',
      )

      // 2. Con valor primero
      if (hasValue(aVal) && !hasValue(bVal)) return -1
      if (!hasValue(aVal) && hasValue(bVal)) return 1

      // 3. Nombre
      return compareStrings(getNombreCompleto(a), getNombreCompleto(b), order)
    }

    // 🧩 Fallback simple
    return compareStrings(normalizeText(a[key] || ''), normalizeText(b[key] || ''), order)
  }
}

/* =========================
   SORT + PAGINACIÓN
========================= */
const sortedAndPaginated = computed(() => {
  const sorted = [...filteredUsers.value]

  if (sortKey.value) {
    sorted.sort(getComparator(sortKey.value))
  }

  return sorted.slice(0, displayedCount.value)
})

const paginatedUsers = sortedAndPaginated

/* =========================
   ACCIONES
========================= */
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

onMounted(loadUsers)
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.cursor-pointer:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.bg-gradient-info {
  background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
}

.card {
  border-radius: 8px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
