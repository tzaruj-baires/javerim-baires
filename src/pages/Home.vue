<template>
  <div class="home">
    <!-- ── Banner de bienvenida ── -->
    <div class="home__hero">
      <div class="home__hero-content">
        <div class="home__hero-text">
          <p class="home__hero-greeting">Hola de nuevo,</p>
          <h1 class="home__hero-name">
            {{ authStore.user?.nickname || authStore.user?.email }}
          </h1>
          <span class="home__hero-level">
            {{ getLevelName(authStore.user?.it_level) }}
          </span>
        </div>
        <div class="home__hero-actions">
          <router-link v-if="can(2)" to="/baja" class="home__btn home__btn--danger">
            <i class="bi bi-person-fill-dash"></i>
            <span>Baja de Javer</span>
          </router-link>
          <router-link v-if="can(2)" to="/alta" class="home__btn home__btn--success">
            <i class="bi bi-person-fill-add"></i>
            <span>Alta de Javer</span>
          </router-link>
          <router-link v-if="can(1)" to="/mi-perfil" class="home__btn home__btn--ghost">
            <i class="bi bi-person-circle"></i>
            <span>Mi Perfil</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- ── Alerta nivel 0 ── -->
    <div v-if="authStore.user?.it_level === 0" class="home__alert">
      <div class="home__alert-icon">
        <i class="bi bi-exclamation-triangle"></i>
      </div>
      <div class="home__alert-body">
        <strong>Acceso Restringido</strong>
        <p>
          Tu cuenta fue creada correctamente, pero requiere aprobación del administrador.
          <strong>Contactá al administrador</strong> para que asigne tu nivel de acceso.
        </p>
        <p class="home__alert-note">
          Una vez aprobada tu cuenta, tendrás que <s>reiniciar sesión</s> para acceder.
        </p>
      </div>
      <button class="home__alert-close" @click="alertVisible = false" aria-label="Cerrar">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <!-- ── Tabla de usuarios ── -->
    <div class="home__table-section" v-if="can(1)">
      <!-- Header de la tabla -->
      <div class="home__table-header">
        <div class="home__table-title">
          <i class="bi bi-people"></i>
          <h2>Usuarios</h2>
          <span class="home__table-count" v-if="!loading">{{ filteredUsers.length }}</span>
        </div>
        <div class="home__table-search">
          <i class="bi bi-search home__search-icon"></i>
          <input
            v-model="searchQuery"
            type="text"
            class="home__search-input"
            placeholder="Buscar por nombre, DNI, área..."
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="home__search-clear">
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>

      <!-- Tabla desktop -->
      <div class="home__table-wrap">
        <table class="home__table">
          <thead>
            <tr>
              <th @click="sortBy('DNI')" class="home__th--sortable">
                DNI <span class="sort-ind">{{ getSortIndicator('DNI') }}</span>
              </th>
              <th @click="sortBy('nombre')" class="home__th--sortable">
                Nombre <span class="sort-ind">{{ getSortIndicator('nombre') }}</span>
              </th>
              <th @click="sortBy('apodo')" class="home__th--sortable home__th--hide-sm">
                Apodo <span class="sort-ind">{{ getSortIndicator('apodo') }}</span>
              </th>
              <th @click="sortBy('organizacion')" class="home__th--sortable home__th--hide-sm">
                Org. <span class="sort-ind">{{ getSortIndicator('organizacion') }}</span>
              </th>
              <th @click="sortBy('areas')" class="home__th--sortable home__th--hide-md">
                Áreas <span class="sort-ind">{{ getSortIndicator('areas') }}</span>
              </th>
              <th @click="sortBy('celular')" class="home__th--sortable home__th--hide-md">
                Celular <span class="sort-ind">{{ getSortIndicator('celular') }}</span>
              </th>
              <th @click="sortBy('mail')" class="home__th--sortable home__th--hide-lg">
                E-Mail <span class="sort-ind">{{ getSortIndicator('mail') }}</span>
              </th>
              <th class="home__th--center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading -->
            <tr v-if="loading">
              <td colspan="8" class="home__td--center">
                <div class="home__spinner"><span class="spinner"></span> Cargando usuarios...</div>
              </td>
            </tr>

            <!-- Vacío -->
            <tr v-else-if="filteredUsers.length === 0">
              <td colspan="8" class="home__td--center home__td--empty">
                <i class="bi bi-inbox"></i>
                <span>No se encontraron usuarios</span>
              </td>
            </tr>

            <!-- Filas -->
            <tr v-else v-for="user in paginatedUsers" :key="user.id" class="home__row">
              <td class="home__td--mono">{{ user.DNI }}</td>
              <td class="home__td--name">{{ user.nombre }} {{ user.apellido }}</td>
              <td class="home__th--hide-sm">{{ user.apodo || '—' }}</td>
              <td class="home__th--hide-sm">
                <span class="home__org-badge" v-if="user.organizacion">{{
                  user.organizacion
                }}</span>
                <span v-else>—</span>
              </td>
              <td class="home__th--hide-md">
                <div class="home__areas" v-if="user.areas">
                  <span v-for="area in splitAreas(user.areas)" :key="area" class="home__area-tag">{{
                    area
                  }}</span>
                </div>
                <span v-else>—</span>
              </td>
              <td class="home__th--hide-md">
                <a
                  :href="`https://wa.me/${user.celular}`"
                  class="home__link home__link--phone"
                  v-if="user.celular"
                  target="_blank"
                >
                  <i class="bi bi-whatsapp"></i> {{ user.celular }}
                </a>
                <span v-else>—</span>
              </td>
              <td class="home__th--hide-lg">
                <a
                  :href="`mailto:${user.mail_operativo || user.mail_personal}`"
                  class="home__link"
                  v-if="user.mail_operativo || user.mail_personal"
                >
                  {{ user.mail_operativo || user.mail_personal }}
                </a>
                <span v-else>—</span>
              </td>
              <td class="home__td--center">
                <router-link :to="`/javer/${user.DNI}`" class="home__edit-btn" title="Ver/Editar">
                  <i class="bi bi-pencil-square"></i>
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Cards mobile (alternativo) -->
      <div class="home__cards" v-if="!loading && paginatedUsers.length > 0">
        <div v-for="user in paginatedUsers" :key="'card-' + user.id" class="home__card">
          <div class="home__card-header">
            <div class="home__card-avatar">
              {{ (user.nombre || user.apodo || '?')[0].toUpperCase() }}
            </div>
            <div class="home__card-info">
              <strong>{{ user.nombre }} {{ user.apellido }}</strong>
              <small v-if="user.apodo">{{ user.apodo }}</small>
            </div>
            <router-link :to="`/javer/${user.DNI}`" class="home__edit-btn">
              <i class="bi bi-pencil-square"></i>
            </router-link>
          </div>
          <div class="home__card-body">
            <div class="home__card-row" v-if="user.DNI">
              <span class="home__card-label">DNI</span>
              <span class="home__td--mono">{{ user.DNI }}</span>
            </div>
            <div class="home__card-row" v-if="user.organizacion">
              <span class="home__card-label">Org.</span>
              <span class="home__org-badge">{{ user.organizacion }}</span>
            </div>
            <div class="home__card-row" v-if="user.areas">
              <span class="home__card-label">Áreas</span>
              <div class="home__areas">
                <span v-for="area in splitAreas(user.areas)" :key="area" class="home__area-tag">{{
                  area
                }}</span>
              </div>
            </div>
            <div class="home__card-row" v-if="user.celular">
              <span class="home__card-label">Celular</span>
              <a
                :href="`https://wa.me/${user.celular}`"
                class="home__link home__link--phone"
                target="_blank"
              >
                <i class="bi bi-whatsapp"></i> {{ user.celular }}
              </a>
            </div>
            <div class="home__card-row" v-if="user.mail_operativo || user.mail_personal">
              <span class="home__card-label">Mail</span>
              <a :href="`mailto:${user.mail_operativo || user.mail_personal}`" class="home__link">
                {{ user.mail_operativo || user.mail_personal }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer / Paginación -->
      <div class="home__table-footer" v-if="!loading">
        <span class="home__table-info">
          Mostrando <strong>{{ paginatedUsers.length }}</strong> de
          <strong>{{ filteredUsers.length }}</strong> usuarios
        </span>
        <div class="home__pagination">
          <button
            v-if="displayedCount < filteredUsers.length"
            @click="loadMore"
            class="home__page-btn"
          >
            <i class="bi bi-chevron-down"></i> Cargar más
          </button>
          <button
            v-if="displayedCount > itemsPerPage"
            @click="showLess"
            class="home__page-btn home__page-btn--ghost"
          >
            <i class="bi bi-chevron-up"></i> Mostrar menos
          </button>
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
const { can, getLevelName } = usePermissions()

const users = ref([])
const loading = ref(true)
const searchQuery = ref('')
const displayedCount = ref(10)
const itemsPerPage = 10
const sortKey = ref('')
const sortOrder = ref('asc')
const alertVisible = ref(true)

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

/**
 * Divide un campo de áreas (separado por ", " o ",") y devuelve array limpio.
 */
const splitAreas = (areasStr = '') =>
  areasStr
    .split(/,\s*/)
    .map((a) => a.trim())
    .filter(Boolean)

/**
 * Comprueba si algún elemento de areasStr coincide con target (normalizado, exacto).
 */
const areaContains = (areasStr = '', target = '') => {
  const items = splitAreas(areasStr).map(normalizeText)
  return items.includes(normalizeText(target))
}

/* =========================
   FILTRADO POR NIVEL
========================= */
const visibleUsers = computed(() => {
  const currentUser = authStore.user
  if (!currentUser) return []

  const level = currentUser.it_level
  const myOrg = normalizeText(currentUser.organizacion || '')
  const myAreasRef = splitAreas(currentUser.areas_ref || '')
  const myAreas = splitAreas(currentUser.areas || '')

  return users.value.filter((u) => {
    // ── Nivel 3: ve todos ──────────────────────────────────────────────
    if (level >= 3) return true

    // ── Nivel 2 ───────────────────────────────────────────────────────
    if (level === 2) {
      // Si areas_ref contiene "ROSH": ve toda su organización
      const isRosh = myAreasRef.some((a) => normalizeText(a) === 'rosh')
      if (isRosh) {
        return normalizeText(u.organizacion || '') === myOrg
      }
      // Caso general: misma org + areas_ref coincidente con areas_ref del usuario
      if (normalizeText(u.organizacion || '') !== myOrg) return false
      const uAreasRef = splitAreas(u.areas_ref || '')
      return myAreasRef.some((ref) =>
        uAreasRef.some((uRef) => normalizeText(uRef) === normalizeText(ref)),
      )
    }

    // ── Nivel 1 ───────────────────────────────────────────────────────
    if (level === 1) {
      // Si areas contiene "JNJ": filtra por org + areas (no areas_ref)
      const isJnj = myAreas.some((a) => normalizeText(a) === 'jnj')
      if (isJnj) {
        if (normalizeText(u.organizacion || '') !== myOrg) return false
        const uAreas = splitAreas(u.areas || '')
        return myAreas.some((area) =>
          uAreas.some((uArea) => normalizeText(uArea) === normalizeText(area)),
        )
      }
      // Caso general: misma org + areas_ref coincidente
      if (normalizeText(u.organizacion || '') !== myOrg) return false
      const uAreasRef = splitAreas(u.areas_ref || '')
      return myAreasRef.some((ref) =>
        uAreasRef.some((uRef) => normalizeText(uRef) === normalizeText(ref)),
      )
    }

    return false
  })
})

/* =========================
   FILTRADO + BÚSQUEDA
========================= */
const filteredUsers = computed(() => {
  // Excluir filas completamente vacías
  let filtered = visibleUsers.value.filter((user) => {
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
      normalizeText(user.areas || '').includes(query) ||
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

    if (key === 'DNI') {
      return order === 'asc' ? Number(a.DNI) - Number(b.DNI) : Number(b.DNI) - Number(a.DNI)
    }

    if (key === 'apodo' || key === 'areas') {
      const orgCompare = compareStrings(getOrg(a), getOrg(b), order)
      if (orgCompare !== 0) return orgCompare
      const aVal = normalizeText(a[key] || '')
      const bVal = normalizeText(b[key] || '')
      if (hasValue(aVal) && !hasValue(bVal)) return -1
      if (!hasValue(aVal) && hasValue(bVal)) return 1
      const valCompare = compareStrings(aVal, bVal, order)
      if (valCompare !== 0) return valCompare
      return compareStrings(getNombreCompleto(a), getNombreCompleto(b), order)
    }

    if (key === 'celular' || key === 'mail') {
      const orgCompare = compareStrings(getOrg(a), getOrg(b), order)
      if (orgCompare !== 0) return orgCompare
      const aVal = normalizeText(
        key === 'mail' ? a.mail_operativo || a.mail_personal || '' : a.celular || '',
      )
      const bVal = normalizeText(
        key === 'mail' ? b.mail_operativo || b.mail_personal || '' : b.celular || '',
      )
      if (hasValue(aVal) && !hasValue(bVal)) return -1
      if (!hasValue(aVal) && hasValue(bVal)) return 1
      return compareStrings(getNombreCompleto(a), getNombreCompleto(b), order)
    }

    return compareStrings(normalizeText(a[key] || ''), normalizeText(b[key] || ''), order)
  }
}

/* =========================
   SORT + PAGINACIÓN
========================= */
const sortedAndPaginated = computed(() => {
  const sorted = [...filteredUsers.value]
  if (sortKey.value) sorted.sort(getComparator(sortKey.value))
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

onMounted(loadUsers)
</script>

<style scoped>
/* ── Variables ── */
.home {
  --c-bg: #f4f6fb;
  --c-surface: #ffffff;
  --c-border: #e5e9f2;
  --c-text: #1a1d2e;
  --c-text-muted: #6b7280;
  --c-accent: #4361ee;
  --c-accent-hover: #2d4fd4;
  --c-success: #059669;
  --c-danger: #dc2626;
  --c-warning-bg: #fffbeb;
  --c-warning-border: #fbbf24;
  --c-warning-text: #92400e;
  --c-org: #dbeafe;
  --c-org-text: #1e40af;
  --c-area: #f0fdf4;
  --c-area-text: #166534;
  --radius: 12px;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.07), 0 4px 16px rgba(0, 0, 0, 0.05);

  min-height: 100vh;
  background: var(--c-bg);
  padding: 1.5rem;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ── Hero ── */
.home__hero {
  background: linear-gradient(135deg, #1e3a8a 0%, #4361ee 60%, #7c3aed 100%);
  border-radius: var(--radius);
  padding: 2rem;
  margin-bottom: 1.5rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.home__hero::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 50%;
}

.home__hero::after {
  content: '';
  position: absolute;
  bottom: -60px;
  right: 80px;
  width: 140px;
  height: 140px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 50%;
}

.home__hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.home__hero-greeting {
  font-size: 0.85rem;
  opacity: 0.75;
  margin-bottom: 0.2rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.home__hero-name {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  line-height: 1.2;
}

.home__hero-level {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.home__hero-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* ── Botones hero ── */
.home__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition:
    transform 0.15s,
    box-shadow 0.15s,
    filter 0.15s;
  white-space: nowrap;
}

.home__btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.home__btn--danger {
  background: #dc2626;
  color: white;
}

.home__btn--success {
  background: #059669;
  color: white;
}

.home__btn--ghost {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(4px);
}

.home__btn--ghost:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* ── Alerta nivel 0 ── */
.home__alert {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  background: var(--c-warning-bg);
  border: 1px solid var(--c-warning-border);
  border-left: 4px solid var(--c-warning-border);
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  color: var(--c-warning-text);
}

.home__alert-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
  padding-top: 0.1rem;
}

.home__alert-body strong {
  display: block;
  font-size: 1rem;
  margin-bottom: 0.35rem;
}

.home__alert-body p {
  margin: 0 0 0.25rem;
  font-size: 0.875rem;
  line-height: 1.6;
}

.home__alert-note {
  font-size: 0.8rem !important;
  opacity: 0.75;
}

.home__alert-close {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--c-warning-text);
  opacity: 0.6;
  font-size: 1rem;
  flex-shrink: 0;
  padding: 0.1rem;
}

.home__alert-close:hover {
  opacity: 1;
}

/* ── Sección tabla ── */
.home__table-section {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

/* Header */
.home__table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--c-border);
  gap: 1rem;
  flex-wrap: wrap;
}

.home__table-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.home__table-title i {
  color: var(--c-accent);
  font-size: 1.1rem;
}

.home__table-title h2 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: var(--c-text);
}

.home__table-count {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
  background: #eff6ff;
  color: var(--c-accent);
}

/* Search */
.home__table-search {
  position: relative;
  flex: 1;
  max-width: 340px;
  min-width: 160px;
}

.home__search-icon {
  position: absolute;
  left: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--c-text-muted);
  font-size: 0.85rem;
  pointer-events: none;
}

.home__search-input {
  width: 100%;
  padding: 0.45rem 2.2rem 0.45rem 2rem;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--c-bg);
  color: var(--c-text);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  box-sizing: border-box;
}

.home__search-input:focus {
  outline: none;
  border-color: var(--c-accent);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

.home__search-clear {
  position: absolute;
  right: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--c-text-muted);
  font-size: 0.85rem;
  padding: 0;
}

.home__search-clear:hover {
  color: var(--c-text);
}

/* ── Tabla ── */
.home__table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.home__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  color: var(--c-text);
}

.home__table thead th {
  padding: 0.65rem 0.9rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--c-text-muted);
  background: #f8fafc;
  border-bottom: 1px solid var(--c-border);
  white-space: nowrap;
  user-select: none;
}

.home__th--sortable {
  cursor: pointer;
  transition: background 0.15s;
}

.home__th--sortable:hover {
  background: #eef2ff;
}

.home__th--center {
  text-align: center;
}

.sort-ind {
  opacity: 0.6;
  font-size: 0.65rem;
}

.home__table tbody tr {
  border-bottom: 1px solid var(--c-border);
  transition: background 0.12s;
}

.home__table tbody tr:last-child {
  border-bottom: none;
}

.home__table tbody tr:hover {
  background: #f8fafc;
}

.home__table td {
  padding: 0.65rem 0.9rem;
  vertical-align: middle;
}

.home__td--mono {
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: var(--c-text-muted);
}

.home__td--name {
  font-weight: 500;
}

.home__td--center {
  text-align: center;
}

.home__td--center-v {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
}

.home__td--center {
  text-align: center;
}

.home__td--center.home__td--empty {
  padding: 2.5rem;
  color: var(--c-text-muted);
}

.home__td--empty i {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
  opacity: 0.4;
}
.home__td--empty span {
  display: block;
}

/* Spinner */
.home__spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--c-text-muted);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--c-border);
  border-top-color: var(--c-accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Badges */
.home__org-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.55rem;
  border-radius: 6px;
  background: var(--c-org);
  color: var(--c-org-text);
  white-space: nowrap;
}

.home__areas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.home__area-tag {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 500;
  padding: 0.1rem 0.45rem;
  border-radius: 5px;
  background: var(--c-area);
  color: var(--c-area-text);
  white-space: nowrap;
}

/* Links */
.home__link {
  color: var(--c-accent);
  text-decoration: none;
  font-size: 0.82rem;
  transition: color 0.15s;
}

.home__link:hover {
  color: var(--c-accent-hover);
  text-decoration: underline;
}

.home__link--phone {
  color: #16a34a;
}
.home__link--phone:hover {
  color: #15803d;
}

/* Botón editar */
.home__edit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 7px;
  color: var(--c-accent);
  background: #eff6ff;
  text-decoration: none;
  transition:
    background 0.15s,
    color 0.15s;
  font-size: 0.85rem;
}

.home__edit-btn:hover {
  background: var(--c-accent);
  color: white;
}

/* ── Footer ── */
.home__table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1.25rem;
  border-top: 1px solid var(--c-border);
  background: #f8fafc;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.home__table-info {
  font-size: 0.82rem;
  color: var(--c-text-muted);
}

.home__pagination {
  display: flex;
  gap: 0.5rem;
}

.home__page-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.82rem;
  font-weight: 500;
  padding: 0.35rem 0.85rem;
  border-radius: 7px;
  border: 1px solid var(--c-border);
  background: white;
  color: var(--c-accent);
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.home__page-btn:hover {
  background: #eff6ff;
  border-color: var(--c-accent);
}

.home__page-btn--ghost {
  color: var(--c-text-muted);
}

.home__page-btn--ghost:hover {
  color: var(--c-text);
  background: var(--c-bg);
}

/* ── Cards (mobile only) ── */
.home__cards {
  display: none;
}

/* ── Ocultar columnas según breakpoint ── */
@media (max-width: 960px) {
  .home__th--hide-lg {
    display: none;
  }
}

@media (max-width: 768px) {
  .home__th--hide-md {
    display: none;
  }

  .home {
    padding: 1rem;
  }

  .home__hero {
    padding: 1.25rem;
  }
  .home__hero-name {
    font-size: 1.35rem;
  }

  .home__hero-actions {
    width: 100%;
  }

  .home__btn span {
    display: none;
  }
  .home__btn {
    padding: 0.5rem 0.65rem;
  }
}

@media (max-width: 540px) {
  /* Ocultamos tabla, mostramos cards */
  .home__table-wrap {
    display: none;
  }
  .home__th--hide-sm {
    display: none;
  }

  .home__cards {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .home__card {
    border-bottom: 1px solid var(--c-border);
    padding: 0.85rem 1rem;
  }

  .home__card:last-child {
    border-bottom: none;
  }

  .home__card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .home__card-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--c-accent), #7c3aed);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
    color: white;
    flex-shrink: 0;
  }

  .home__card-info {
    flex: 1;
    overflow: hidden;
  }

  .home__card-info strong {
    display: block;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .home__card-info small {
    font-size: 0.75rem;
    color: var(--c-text-muted);
  }

  .home__card-body {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .home__card-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.82rem;
  }

  .home__card-label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--c-text-muted);
    min-width: 48px;
    flex-shrink: 0;
  }
}

/* ── Ajuste padding total en mobile ── */
@media (max-width: 420px) {
  .home {
    padding: 0.75rem;
  }
  .home__hero-name {
    font-size: 1.2rem;
  }
}
</style>
