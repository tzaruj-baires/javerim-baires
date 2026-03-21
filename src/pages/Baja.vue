<template>
  <div class="jv-page">
    <!-- ── Header ── -->
    <div class="jv-page-header">
      <div class="jv-page-header__left">
        <div
          class="jv-page-header__icon"
          style="background: linear-gradient(135deg, #dc2626, #991b1b)"
        >
          <i class="bi bi-person-dash-fill"></i>
        </div>
        <div>
          <p class="jv-page-header__eyebrow">Gestión de miembros</p>
          <h1 class="jv-page-header__title">Dar de Baja</h1>
        </div>
      </div>
    </div>

    <!-- ── Aviso irreversible ── -->
    <div class="jv-alert jv-alert--warning" style="margin-bottom: 1.5rem">
      <i class="bi bi-exclamation-triangle"></i>
      <span
        >Esta acción es <strong>irreversible</strong>. El usuario será dado de baja y sus datos
        archivados para trazabilidad.</span
      >
    </div>

    <!-- ── Alertas de feedback ── -->
    <div v-if="successMessage" class="jv-alert jv-alert--success" style="margin-bottom: 1rem">
      <i class="bi bi-check-circle"></i> {{ successMessage }}
      <button class="jv-alert__close" @click="successMessage = ''">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
    <div v-if="errorMessage" class="jv-alert jv-alert--danger" style="margin-bottom: 1rem">
      <i class="bi bi-exclamation-circle"></i> {{ errorMessage }}
      <button class="jv-alert__close" @click="errorMessage = ''"><i class="bi bi-x-lg"></i></button>
    </div>

    <div class="baja-layout">
      <!-- ── Panel buscar usuario ── -->
      <div class="jv-card baja-search-card">
        <div class="baja-card-header">
          <span class="baja-card-header__icon"><i class="bi bi-search"></i></span>
          <h2 class="baja-card-header__title">Buscar usuario</h2>
        </div>
        <div class="baja-card-body">
          <div class="jv-field">
            <label class="jv-label" for="searchDni"
              >DNI del usuario <span class="baja-required">*</span></label
            >
            <div class="baja-search-row">
              <input
                v-model="searchDni"
                type="number"
                class="jv-input"
                id="searchDni"
                placeholder="Ingresá el DNI"
                min="1000000"
                max="99999999"
                @blur="searchUser"
                @keydown.enter.prevent="searchUser"
              />
              <button
                class="jv-btn jv-btn--ghost"
                type="button"
                @click="searchUser"
                :disabled="isSearching"
              >
                <span v-if="!isSearching"><i class="bi bi-search"></i></span>
                <span v-else class="jv-spinner jv-spinner--sm"></span>
              </button>
            </div>
          </div>

          <!-- Datos del usuario encontrado -->
          <div v-if="userData" class="baja-user-card">
            <div class="baja-user-card__avatar">
              {{ (userData.nombre || '?')[0].toUpperCase() }}
            </div>
            <div class="baja-user-card__info">
              <p class="baja-user-card__name">{{ userData.nombre }} {{ userData.apellido }}</p>
              <p class="baja-user-card__meta" v-if="userData.apodo">{{ userData.apodo }}</p>
              <div class="baja-user-card__tags">
                <span class="jv-badge jv-badge--org" v-if="userData.organizacion">{{
                  userData.organizacion
                }}</span>
                <span class="jv-badge jv-badge--area" v-if="userData.areas">{{
                  userData.areas
                }}</span>
              </div>
            </div>
            <span class="jv-mono baja-user-card__dni">{{ userData.DNI }}</span>
          </div>
        </div>
      </div>

      <!-- ── Formulario de baja (visible solo si hay usuario) ── -->
      <div v-if="userData" class="jv-card baja-form-card">
        <div class="baja-card-header">
          <span class="baja-card-header__icon baja-card-header__icon--red"
            ><i class="bi bi-clipboard-x"></i
          ></span>
          <h2 class="baja-card-header__title">Datos de la baja</h2>
        </div>
        <div class="baja-card-body">
          <!-- Tipo de baja -->
          <div class="jv-field">
            <label class="jv-label" for="tipoBaja"
              >Tipo de Baja <span class="baja-required">*</span></label
            >
            <select v-model="formData.tipo_baja" class="jv-input jv-select" id="tipoBaja" required>
              <option value="">Seleccioná tipo de baja</option>
              <option value="Janij">Janij</option>
              <option value="Voluntario">Voluntario</option>
            </select>
          </div>

          <!-- Años voluntario + Rol máximo -->
          <div class="baja-two-col">
            <div class="jv-field">
              <label class="jv-label" for="anosVoluntario">Años en la Organización</label>
              <input
                v-model.number="formData.años_voluntario"
                type="number"
                class="jv-input"
                id="anosVoluntario"
                placeholder="Ej: 2"
                min="0"
              />
            </div>
            <div class="jv-field">
              <label class="jv-label" for="rolMax">Rol Máximo Alcanzado</label>
              <input
                v-model="formData.rol_max"
                type="text"
                class="jv-input"
                id="rolMax"
                placeholder="Ej: Coordinador"
              />
            </div>
          </div>

          <!-- Cursos -->
          <div class="jv-field">
            <label class="jv-label">Cursos Realizados</label>
            <div class="baja-curso-row">
              <select v-model="nuevoCurso.nombre" class="jv-input jv-select" id="cursosSelect">
                <option value="">Seleccioná un curso</option>
                <option v-for="curso in cursosMis" :value="curso.value" :key="curso.value">
                  {{ curso.label }}
                </option>
              </select>
              <input
                v-model="nuevoCurso.detalle"
                type="text"
                class="jv-input"
                placeholder="Detalles del curso"
              />
              <button
                type="button"
                class="jv-btn jv-btn--ghost"
                @click="agregarCurso"
                :disabled="!nuevoCurso.nombre"
              >
                <i class="bi bi-plus-lg"></i>
              </button>
            </div>
            <div v-if="formData.cursos.length > 0" class="baja-curso-list">
              <div v-for="(curso, index) in formData.cursos" :key="index" class="baja-curso-item">
                <span>
                  <strong>{{ curso.nombre }}</strong>
                  <span v-if="curso.detalle" class="baja-curso-item__detail">
                    — {{ curso.detalle }}</span
                  >
                </span>
                <button
                  type="button"
                  class="jv-action-btn jv-action-btn--delete"
                  @click="eliminarCurso(index)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
            <span v-else class="jv-hint">No hay cursos agregados aún</span>
          </div>

          <!-- Áreas Históricas -->
          <div class="jv-field" v-if="areasHistoricasOpciones.length > 0">
            <label class="jv-label">Áreas Históricas</label>
            <div class="baja-checkboxes">
              <label v-for="area in areasHistoricasOpciones" :key="area" class="baja-check-label">
                <input
                  type="checkbox"
                  :value="area"
                  v-model="formData.areas_historicas"
                  class="baja-checkbox"
                  style="accent-color: var(--jv-accent)"
                />
                <span>{{ area }}</span>
              </label>
            </div>
          </div>

          <!-- Motivos -->
          <div class="jv-field">
            <label class="jv-label">Tipo de Motivo <span class="baja-required">*</span></label>
            <div class="baja-checkboxes">
              <label v-for="motivo in motivosOpciones" :key="motivo.value" class="baja-check-label">
                <input
                  type="checkbox"
                  :value="motivo.value"
                  v-model="formData.motivo_tipo"
                  class="baja-checkbox"
                />
                <span>{{ motivo.label }}</span>
              </label>
            </div>
          </div>

          <!-- Motivo detalle -->
          <div class="jv-field">
            <label class="jv-label" for="motivoDetalle"
              >Detalle del Motivo <span class="baja-required">*</span></label
            >
            <textarea
              v-model="formData.motivo_detalle"
              class="jv-input baja-textarea"
              id="motivoDetalle"
              rows="3"
              placeholder="Describí el motivo de la baja"
              required
            ></textarea>
          </div>

          <!-- Reunión -->
          <div class="jv-field">
            <label class="jv-label" for="reunion">¿Se tuvo reunión de cierre?</label>
            <input
              v-model="formData.reunion"
              type="text"
              class="jv-input"
              id="reunion"
              placeholder="Sí/No, detalles sobre cuándo y por qué"
            />
          </div>

          <!-- Miluim -->
          <div class="jv-field">
            <label class="jv-label" for="miluim">¿Se pasó su contacto a Miluim?</label>
            <input
              v-model="formData.miluim"
              type="text"
              class="jv-input"
              id="miluim"
              placeholder="Sí/No, detalles"
            />
          </div>

          <!-- Comentarios -->
          <div class="jv-field">
            <label class="jv-label" for="comentarios">Comentarios</label>
            <textarea
              v-model="formData.comentarios"
              class="jv-input baja-textarea"
              id="comentarios"
              rows="3"
              placeholder="Comentarios adicionales"
            ></textarea>
          </div>

          <!-- Botones -->
          <div class="baja-actions">
            <button
              type="button"
              class="jv-btn jv-btn--danger"
              style="flex: 1"
              :disabled="isLoading"
              @click="confirmarBaja"
            >
              <span v-if="!isLoading"><i class="bi bi-x-circle"></i> Dar de Baja</span>
              <span v-else class="baja-loading"
                ><span class="jv-spinner jv-spinner--sm jv-spinner--white"></span>
                Procesando...</span
              >
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
import { v4 as uuidv4 } from 'uuid'
import { cursosMis } from '@/utils/forms_consts'

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
  areas_historicas: [],
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const motivosOpciones = [
  { value: 'Desmotivación personal', label: 'Desmotivación general' },
  { value: 'Desmotivación en la parte física', label: 'Desmotivación en la parte física' },
  { value: 'Problemas familiares', label: 'Problemas familiares' },
  { value: 'Falta de tiempo', label: 'Falta de tiempo' },
  { value: 'Problemas personales', label: 'Problemas personales' },
  { value: 'No cree en la causa', label: 'No cree en la causa' },
  { value: 'Otros', label: 'Otros' },
]

const { can, canAccessUser } = usePermissions()

onMounted(async () => {
  const router = useRouter()
  if (!can(2)) {
    router.push('/')
    return
  }
  await loadMjlktData()
})

// Datos de mjlkt (se carga una sola vez al montar, igual que ProfileForm)
const mjlktData = ref([])

const loadMjlktData = async () => {
  try {
    const response = await api.getAll('mjlkt')
    mjlktData.value = response.data || []
  } catch (error) {
    console.error('Error al cargar mjlkt:', error)
  }
}

// Áreas únicas de la org del usuario — computed sobre los datos ya cargados
const areasHistoricasOpciones = computed(() => {
  if (!userData.value?.organizacion) return []
  return [
    ...new Set(
      mjlktData.value
        .filter((r) => r.org === userData.value.organizacion)
        .map((r) => r.rol)
        .filter(Boolean),
    ),
  ].sort()
})

const searchUser = async () => {
  if (!searchDni.value) {
    errorMessage.value = 'Ingresá un DNI para buscar'
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

    if (!canAccessUser(user.DNI, user)) {
      errorMessage.value = 'No tenés permisos para dar de baja a este usuario'
      return
    }

    userData.value = user
    formData.value.años_voluntario = user.años_voluntario || null
    formData.value.rol_max = user.rol_max || ''
    formData.value.cursos = []

    // Pre-fill: unión de areas_historicas + areas actuales, filtrado a opciones disponibles, sin duplicados
    const preHistoricas = user.areas_historicas
      ? user.areas_historicas
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean)
      : []
    const preAreas = user.areas
      ? user.areas
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean)
      : []
    const preUnidas = [...new Set([...preHistoricas, ...preAreas])]
    formData.value.areas_historicas = preUnidas.filter((a) =>
      areasHistoricasOpciones.value.includes(a),
    )
  } catch (error) {
    console.error('Error buscando usuario:', error)
    errorMessage.value = 'Error al buscar el usuario'
  } finally {
    isSearching.value = false
  }
}

const agregarCurso = () => {
  if (!nuevoCurso.value.nombre) return
  formData.value.cursos.push({
    nombre: nuevoCurso.value.nombre,
    detalle: nuevoCurso.value.detalle,
  })
  nuevoCurso.value = { nombre: '', detalle: '' }
}

const eliminarCurso = (index) => {
  formData.value.cursos.splice(index, 1)
}

const validateForm = () => {
  errorMessage.value = ''
  if (!formData.value.tipo_baja) {
    errorMessage.value = 'El tipo de baja es requerido'
    return false
  }
  if (!Array.isArray(formData.value.motivo_tipo) || formData.value.motivo_tipo.length === 0) {
    errorMessage.value = 'Seleccioná al menos un tipo de motivo'
    return false
  }
  if (!formData.value.motivo_detalle.trim()) {
    errorMessage.value = 'El detalle del motivo es requerido'
    return false
  }
  return true
}

const confirmarBaja = () => {
  const confirmacion = confirm(
    `¿Estás seguro que deseas dar de baja a ${userData.value.nombre} ${userData.value.apellido}? \n\nEsta acción es irreversible.`,
  )
  if (confirmacion) {
    handleSubmit()
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return

  // Segunda barrera: re-verificar permisos antes de ejecutar la baja
  if (!canAccessUser(userData.value.DNI, userData.value)) {
    errorMessage.value = 'No tenés permisos para dar de baja a este usuario'
    return
  }

  try {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const cursosString = formData.value.cursos
      .map((c) => `${c.nombre}${c.detalle ? ': ' + c.detalle : ''}`)
      .join(',\n')

    const motivosString = formData.value.motivo_tipo.join(', ')

    const bajaRecord = {
      id_baja: uuidv4(),
      dni: userData.value.DNI,
      nombre: userData.value.nombre,
      apellido: userData.value.apellido,
      apodo: userData.value.apodo || '',
      tipo_baja: formData.value.tipo_baja,
      años_voluntario: formData.value.años_voluntario || 0,
      rol_max: formData.value.rol_max,
      areas_historicas: '',
      cursos: cursosString,
      motivo_tipo: motivosString,
      motivo_detalle: formData.value.motivo_detalle,
      reunion: formData.value.reunion,
      miluim: formData.value.miluim,
      comentarios: formData.value.comentarios,
    }

    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const fechaUlt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
    const fechaMilu = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    const timestamp = fechaUlt

    const updateData = {
      DNI: userData.value.DNI,
      activo: 0,
      fecha_ult: fechaUlt,
    }

    // Merge areas_historicas: checkbox base (pre-cargado + modificado por el usuario) + área actual, sin duplicados
    const buildAreasHistoricas = (checkboxList, currentAreas) => {
      const base = Array.isArray(checkboxList) ? [...checkboxList] : []
      const current = currentAreas
        ? currentAreas
            .split(',')
            .map((a) => a.trim())
            .filter(Boolean)
        : []
      const merged = [...base]
      for (const area of current) {
        if (!merged.includes(area)) merged.push(area)
      }
      return merged.join(', ')
    }

    const areasHistoricas = buildAreasHistoricas(
      formData.value.areas_historicas,
      userData.value.areas,
    )

    if (formData.value.tipo_baja === 'Janij') {
      updateData.areas = ''
      updateData.areas_ref = ''
      bajaRecord.areas_historicas = areasHistoricas
      updateData.areas_historicas = areasHistoricas
    } else if (formData.value.tipo_baja === 'Voluntario') {
      updateData.areas = 'MILU'
      updateData.areas_ref = 'MILU'
      bajaRecord.areas_historicas = areasHistoricas
      updateData.areas_historicas = areasHistoricas
      updateData.fecha_ingresoMilu = fechaMilu
    }

    bajaRecord.timestamp = timestamp

    await api.create('bajas_activo', bajaRecord)
    await api.update('main', updateData)

    successMessage.value = '¡Usuario dado de baja correctamente!'
    resetForm()

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
    areas_historicas: [],
  }
  errorMessage.value = ''
}
</script>

<style scoped>
@import '@/assets/css/styles.css';

/* ── Layout ── */
.baja-layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 1.25rem;
  align-items: start;
}

/* ── Card header ── */
.baja-card-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.9rem 1.1rem;
  border-bottom: 1px solid var(--jv-border);
}

.baja-card-header__icon {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: #eff6ff;
  color: var(--jv-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.baja-card-header__icon--red {
  background: #fef2f2;
  color: var(--jv-danger);
}

.baja-card-header__title {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
  color: var(--jv-text);
}

.baja-card-body {
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ── Search ── */
.baja-search-row {
  display: flex;
  gap: 0.4rem;
}

.baja-search-row .jv-input {
  flex: 1;
}

/* ── User card ── */
.baja-user-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem;
  background: #f8fafc;
  border-radius: 9px;
  border: 1px solid var(--jv-border);
}

.baja-user-card__avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--jv-accent), #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: white;
  flex-shrink: 0;
}

.baja-user-card__info {
  flex: 1;
  overflow: hidden;
}

.baja-user-card__name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--jv-text);
  margin: 0 0 0.15rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.baja-user-card__meta {
  font-size: 0.75rem;
  color: var(--jv-text-muted);
  margin: 0 0 0.4rem;
}

.baja-user-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.baja-user-card__dni {
  font-size: 0.75rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

/* ── Required marker ── */
.baja-required {
  color: var(--jv-danger);
  font-weight: 700;
}

/* ── Two-col grid ── */
.baja-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

/* ── Curso row ── */
.baja-curso-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.4rem;
}

.baja-curso-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.5rem;
}

.baja-curso-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-radius: 7px;
  background: #f8fafc;
  border: 1px solid var(--jv-border);
  font-size: 0.82rem;
}

.baja-curso-item__detail {
  color: var(--jv-text-muted);
}

/* ── Checkboxes ── */
.baja-checkboxes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
}

.baja-check-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--jv-text);
  cursor: pointer;
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  transition: background 0.12s;
}

.baja-check-label:hover {
  background: #f8fafc;
}

.baja-checkbox {
  width: 15px;
  height: 15px;
  accent-color: var(--jv-danger);
  cursor: pointer;
  flex-shrink: 0;
}

/* ── Textarea ── */
.baja-textarea {
  resize: vertical;
  min-height: 80px;
}

/* ── Actions ── */
.baja-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.25rem;
}

.baja-loading {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .baja-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .baja-two-col {
    grid-template-columns: 1fr;
  }
  .baja-checkboxes {
    grid-template-columns: 1fr;
  }
  .baja-curso-row {
    grid-template-columns: 1fr;
  }
}
</style>
