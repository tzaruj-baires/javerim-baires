<template>
  <div>
    <!-- Mensajes globales -->
    <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
      <i class="bi bi-check-circle me-2"></i>{{ successMessage }}
      <button type="button" class="btn-close" @click="successMessage = ''"></button>
    </div>
    <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>{{ errorMessage }}
      <button type="button" class="btn-close" @click="errorMessage = ''"></button>
    </div>

    <!-- PASO 1: Zona de carga -->
    <div v-if="step === 1">
      <!-- Descarga de plantilla -->
      <div class="d-flex justify-content-end mb-3">
        <button class="btn btn-outline-secondary btn-sm">
          <a
            href="https://docs.google.com/spreadsheets/d/1lIDendDqH6KhctatcfFfZrsMCIIbHw9_gNmKap_hlJE/template/preview"
            target="_blank"
            class="text-reset text-decoration-none"
          >
            <i class="bi bi-download me-1"></i>Utilizar plantilla
          </a>
        </button>
      </div>

      <!-- Dropzone -->
      <div
        class="dropzone"
        :class="{ 'dropzone--over': isDragging, 'dropzone--error': parseError }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
        @click="triggerFileInput"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".csv,.xlsx,.xls"
          class="d-none"
          @change="onFileChange"
        />
        <div class="dropzone__content">
          <i class="bi bi-cloud-upload dropzone__icon"></i>
          <p class="dropzone__title">
            Arrastrá tu archivo acá o <span class="dropzone__link">hacé clic para elegir</span>
          </p>
          <p class="dropzone__subtitle">CSV, Excel (.xlsx, .xls) — máx. 5 MB</p>
          <p v-if="parseError" class="text-danger mt-2 mb-0">
            <i class="bi bi-exclamation-circle me-1"></i>{{ parseError }}
          </p>
        </div>
      </div>

      <!-- Columnas requeridas -->
      <div class="columns-info mt-3">
        <p class="columns-info__title">
          <i class="bi bi-info-circle me-1"></i>Columnas reconocidas (el orden no importa):
        </p>
        <div class="columns-info__tags">
          <span
            v-for="col in COLUMN_MAP_DISPLAY"
            :key="col.key"
            class="column-tag"
            :class="col.required ? 'column-tag--required' : 'column-tag--optional'"
          >
            {{ col.label }}<span v-if="col.required" class="ms-1 text-danger">*</span>
          </span>
        </div>
      </div>
    </div>

    <!-- PASO 2: Previsualización y validación -->
    <div v-if="step === 2">
      <!-- Resumen de estado -->
      <div class="preview-summary mb-3">
        <div class="preview-summary__stat preview-summary__stat--total">
          <i class="bi bi-people-fill me-1"></i>
          <strong>{{ rows.length }}</strong> fila(s) detectadas
        </div>
        <div class="preview-summary__stat preview-summary__stat--ok" v-if="validRows > 0">
          <i class="bi bi-check-circle-fill me-1"></i>
          <strong>{{ validRows }}</strong> válidas
        </div>
        <div class="preview-summary__stat preview-summary__stat--error" v-if="invalidRows > 0">
          <i class="bi bi-x-circle-fill me-1"></i>
          <strong>{{ invalidRows }}</strong> con errores
        </div>
      </div>

      <!-- Tabla de previsualización -->
      <div class="preview-table-wrapper">
        <table class="preview-table">
          <thead>
            <tr>
              <th class="col-row">#</th>
              <th
                v-for="col in COLUMN_MAP_DISPLAY"
                :key="col.key"
                :class="col.required ? 'col-required' : ''"
              >
                {{ col.label }}<span v-if="col.required" class="text-danger ms-1">*</span>
              </th>
              <th class="col-status">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in rows"
              :key="idx"
              :class="rowHasError(row) ? 'row--error' : 'row--ok'"
            >
              <td class="col-row text-muted">{{ idx + 1 }}</td>
              <td
                v-for="col in COLUMN_MAP_DISPLAY"
                :key="col.key"
                :class="{ 'cell--error': row._errors && row._errors[col.key] }"
              >
                <input
                  class="cell-input"
                  :class="{ 'cell-input--error': row._errors && row._errors[col.key] }"
                  v-model="row[col.key]"
                  :placeholder="col.label"
                  @input="revalidateRow(row, idx)"
                  @blur="revalidateRow(row, idx)"
                />
                <small v-if="row._errors && row._errors[col.key]" class="cell-error-msg">
                  {{ row._errors[col.key] }}
                </small>
              </td>
              <td class="col-status">
                <span v-if="!rowHasError(row)" class="badge bg-success">
                  <i class="bi bi-check-lg"></i> OK
                </span>
                <span v-else class="badge bg-danger"> <i class="bi bi-x-lg"></i> Error </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Acciones -->
      <div class="d-flex gap-2 mt-4 flex-wrap">
        <button class="btn btn-outline-secondary" @click="reset">
          <i class="bi bi-arrow-left me-1"></i>Volver
        </button>
        <button
          class="btn btn-primary ms-auto"
          :disabled="invalidRows > 0 || isLoading"
          @click="handleBulkSubmit"
        >
          <span v-if="!isLoading">
            <i class="bi bi-people-fill me-2"></i>Dar de alta {{ validRows }} persona(s)
          </span>
          <span v-else>
            <span
              class="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            Registrando... ({{ uploadProgress }}/{{ rows.length }})
          </span>
        </button>
      </div>

      <p v-if="invalidRows > 0" class="text-danger mt-2 mb-0 small">
        <i class="bi bi-info-circle me-1"></i>Corregí los errores en la tabla antes de continuar.
        Podés editar las celdas directamente.
      </p>
    </div>

    <!-- PASO 3: Resultado -->
    <div v-if="step === 3">
      <div class="result-panel">
        <div v-if="uploadResults.success.length > 0" class="result-block result-block--success">
          <i class="bi bi-check-circle-fill result-block__icon"></i>
          <div>
            <strong>{{ uploadResults.success.length }} personas dadas de alta correctamente</strong>
            <ul class="result-list mt-1">
              <li v-for="r in uploadResults.success" :key="r.DNI">
                {{ r.nombre }} {{ r.apellido }} — DNI {{ r.DNI }}
              </li>
            </ul>
          </div>
        </div>
        <div v-if="uploadResults.failed.length > 0" class="result-block result-block--error mt-3">
          <i class="bi bi-x-circle-fill result-block__icon"></i>
          <div>
            <strong>{{ uploadResults.failed.length }} persona(s) no pudieron darse de alta</strong>
            <ul class="result-list mt-1">
              <li v-for="r in uploadResults.failed" :key="r.DNI">
                {{ r.nombre }} {{ r.apellido }} — {{ r.reason }}
              </li>
            </ul>
          </div>
        </div>
        <button class="btn btn-primary mt-4" @click="reset">
          <i class="bi bi-arrow-clockwise me-2"></i>Cargar otro archivo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import * as api from '@/services/api'

// ── Mapeado de columnas ──────────────────────────────────────────────────────
// El parseo es por nombre de columna (case-insensitive, trim), NO por posición.
// aliases: variaciones del nombre que el usuario puede poner en el CSV/Excel.
const COLUMN_MAP = [
  { key: 'dni', aliases: ['dni'], required: true, label: 'DNI' },
  { key: 'nombre', aliases: ['nombre', 'name', 'first name'], required: true, label: 'Nombre' },
  {
    key: 'apellido',
    aliases: ['apellido', 'last name', 'surname'],
    required: true,
    label: 'Apellido',
  },
  {
    key: 'celular',
    aliases: ['celular', 'telefono', 'tel', 'phone'],
    required: true,
    label: 'Celular',
  },
  { key: 'organizacion', aliases: ['organizacion', 'org'], required: true, label: 'Organización' },
  { key: 'apodo', aliases: ['apodo', 'nickname'], required: false, label: 'Apodo' },
  {
    key: 'mailOperativo',
    aliases: ['mail_operativo', 'mail operativo', 'email operativo', 'email', 'e-mail'],
    required: false,
    label: 'Email Operativo',
  },
  {
    key: 'mailPersonal',
    aliases: ['mail_personal', 'mail personal', 'email personal'],
    required: false,
    label: 'Email Personal',
  },
  {
    key: 'areasRef',
    aliases: ['areas_ref', 'areas ref', 'areasref', 'area_ref'],
    required: false,
    label: 'Áreas Ref.',
  },
  { key: 'areas', aliases: ['areas', 'roles'], required: false, label: 'Roles' },
]

const COLUMN_MAP_DISPLAY = COLUMN_MAP

// ── Estado ───────────────────────────────────────────────────────────────────
const step = ref(1)
const isDragging = ref(false)
const parseError = ref('')
const fileInput = ref(null)
const rows = ref([]) // cada row es { dni, nombre, ..., _errors: {} }
const isLoading = ref(false)
const uploadProgress = ref(0)
const successMessage = ref('')
const errorMessage = ref('')
const uploadResults = ref({ success: [], failed: [] })

// ── Computed ─────────────────────────────────────────────────────────────────
const validRows = computed(() => rows.value.filter((r) => !rowHasError(r)).length)
const invalidRows = computed(() => rows.value.filter((r) => rowHasError(r)).length)

// ── Utilidades de parseo ──────────────────────────────────────────────────────
// Normaliza un header de columna para comparación
function normalizeHeader(h) {
  return h.toString().toLowerCase().trim().replace(/\s+/g, ' ')
}

// Dado un header crudo, devuelve el key interno o null
function resolveKey(rawHeader) {
  const normalized = normalizeHeader(rawHeader)
  for (const col of COLUMN_MAP) {
    if (col.aliases.some((a) => a === normalized)) return col.key
  }
  return null
}

// Convierte un array de arrays (rows) a array de objetos usando la primera fila como headers
function arraysToObjects(data) {
  if (data.length < 2) return []
  const headers = data[0]
  const keyMap = headers.map((h) => resolveKey(h)) // posición → key interno

  return data
    .slice(1)
    .map((rowArr) => {
      const obj = {}
      keyMap.forEach((key, i) => {
        if (key) obj[key] = rowArr[i] !== undefined ? String(rowArr[i]).trim() : ''
      })
      // Rellenar keys faltantes con ''
      COLUMN_MAP.forEach((col) => {
        if (!(col.key in obj)) obj[col.key] = ''
      })
      return obj
    })
    .filter((row) => {
      // Ignorar filas completamente vacías
      return COLUMN_MAP.some((col) => row[col.key] !== '')
    })
}

// ── Parseo CSV (sin dependencia externa) ─────────────────────────────────────
function parseCSV(text) {
  const lines = text.split(/\r?\n/)
  return lines
    .filter((l) => l.trim() !== '')
    .map((line) => {
      const result = []
      let cell = '',
        inQuotes = false
      for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        if (ch === '"') {
          inQuotes = !inQuotes
        } else if (ch === ',' && !inQuotes) {
          result.push(cell.trim())
          cell = ''
        } else {
          cell += ch
        }
      }
      result.push(cell.trim())
      return result
    })
}

// ── Parseo Excel usando SheetJS desde CDN ─────────────────────────────────────
async function parseExcel(file) {
  return new Promise((resolve, reject) => {
    // Cargamos SheetJS dinámicamente si no está disponible
    if (typeof window.XLSX === 'undefined') {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
      script.onload = () => doParseExcel(file, resolve, reject)
      script.onerror = () => reject(new Error('No se pudo cargar la librería para leer Excel'))
      document.head.appendChild(script)
    } else {
      doParseExcel(file, resolve, reject)
    }
  })
}

function doParseExcel(file, resolve, reject) {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const XLSX = window.XLSX
      const wb = XLSX.read(e.target.result, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      resolve(data)
    } catch (err) {
      reject(err)
    }
  }
  reader.onerror = () => reject(new Error('Error al leer el archivo'))
  reader.readAsArrayBuffer(file)
}

// ── Validación por fila ───────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateRow(row, existingDNIs, batchDNIs) {
  const errors = {}

  // DNI
  const dniStr = String(row.dni || '').trim()
  if (!dniStr) {
    errors.dni = 'Requerido'
  } else if (!/^\d{7,8}$/.test(dniStr)) {
    errors.dni = '7 u 8 dígitos'
  } else if (existingDNIs.has(dniStr)) {
    errors.dni = 'Ya existe en BD'
  } else if (batchDNIs.has(dniStr)) {
    errors.dni = 'Duplicado en archivo'
  }

  // Nombre
  if (!String(row.nombre || '').trim()) errors.nombre = 'Requerido'
  // Apellido
  if (!String(row.apellido || '').trim()) errors.apellido = 'Requerido'
  // Celular
  if (!String(row.celular || '').trim()) errors.celular = 'Requerido'
  // Organización
  if (!String(row.organizacion || '').trim()) errors.organizacion = 'Requerida'

  // Emails opcionales pero si tienen valor deben ser válidos
  const mo = String(row.mailOperativo || '').trim()
  if (mo && !EMAIL_REGEX.test(mo)) errors.mailOperativo = 'Email inválido'
  const mp = String(row.mailPersonal || '').trim()
  if (mp && !EMAIL_REGEX.test(mp)) errors.mailPersonal = 'Email inválido'

  return errors
}

function rowHasError(row) {
  return row._errors && Object.keys(row._errors).length > 0
}

// ── Proceso de carga de archivo ───────────────────────────────────────────────
async function processFile(file) {
  parseError.value = ''

  const ext = file.name.split('.').pop().toLowerCase()
  let rawData

  try {
    if (ext === 'csv') {
      const text = await file.text()
      rawData = parseCSV(text)
    } else if (['xlsx', 'xls'].includes(ext)) {
      rawData = await parseExcel(file)
    } else {
      parseError.value = 'Formato no soportado. Usá CSV o Excel (.xlsx, .xls)'
      return
    }
  } catch (e) {
    parseError.value = `Error al leer el archivo: ${e.message}`
    return
  }

  if (!rawData || rawData.length < 2) {
    parseError.value = 'El archivo está vacío o no tiene datos'
    return
  }

  const parsed = arraysToObjects(rawData)
  if (parsed.length === 0) {
    parseError.value = 'No se encontraron filas con datos. Verificá el formato del archivo.'
    return
  }

  // Traer DNIs existentes en BD
  let existingDNIs = new Set()
  try {
    const res = await api.getAll('main')
    existingDNIs = new Set((res.data || []).map((r) => String(r.DNI).trim()))
  } catch (e) {
    errorMessage.value = 'No se pudo conectar con la base de datos para verificar duplicados'
  }

  // Detectar duplicados dentro del mismo archivo
  const seenDNIs = new Set()
  const batchDNIs = new Set()
  parsed.forEach((row) => {
    const d = String(row.dni || '').trim()
    if (d) {
      if (seenDNIs.has(d)) batchDNIs.add(d)
      else seenDNIs.add(d)
    }
  })

  // Validar cada fila
  rows.value = parsed.map((row) => ({
    ...row,
    _errors: validateRow(row, existingDNIs, batchDNIs),
  }))

  step.value = 2
}

function revalidateRow(row, _idx) {
  // Para revalidar necesitamos los DNIs actuales del resto de filas
  const allDNIs = rows.value
    .filter((r) => r !== row)
    .map((r) => String(r.dni || '').trim())
    .filter(Boolean)

  const batchDNIs = new Set()
  const seen = new Set()
  allDNIs.forEach((d) => {
    if (seen.has(d)) batchDNIs.add(d)
    else seen.add(d)
  })

  // Traemos existingDNIs de manera síncrona del store si ya lo cargamos,
  // por simplicidad re-usamos el conjunto vacío: el error de BD se vuelve a
  // mostrar solo al intentar hacer submit (o si el usuario no editó el DNI).
  row._errors = validateRow(row, new Set(), batchDNIs)
}

// ── Handlers de input ─────────────────────────────────────────────────────────
function triggerFileInput() {
  fileInput.value?.click()
}

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (file) processFile(file)
}

function onDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files?.[0]
  if (file) processFile(file)
}

// ── Submit masivo ─────────────────────────────────────────────────────────────
async function handleBulkSubmit() {
  isLoading.value = true
  uploadProgress.value = 0
  const results = { success: [], failed: [] }

  const now = new Date()
  const fechaUlt = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  for (const row of rows.value) {
    try {
      const newUser = {
        ID_JVR: `${row.organizacion.trim()}@${parseInt(row.dni)}`,
        fecha_ult: fechaUlt,
        DNI: parseInt(row.dni),
        nombre: row.nombre.trim(),
        apellido: row.apellido.trim(),
        apodo: (row.apodo || '').trim(),
        email: (row.mailOperativo || '').trim(),
        celular: row.celular.trim(),
        mail_operativo: (row.mailOperativo || '').trim(),
        mail_personal: (row.mailPersonal || '').trim(),
        organizacion: row.organizacion.trim(),
        areas: (row.areas || '').trim(),
        areas_ref: (row.areasRef || '').trim(),
      }
      await api.create('main', newUser)
      results.success.push({ DNI: row.dni, nombre: row.nombre, apellido: row.apellido })
    } catch (e) {
      results.failed.push({
        DNI: row.dni,
        nombre: row.nombre,
        apellido: row.apellido,
        reason: e.response?.data?.message || e.message || 'Error desconocido',
      })
    }
    uploadProgress.value++
  }

  uploadResults.value = results
  isLoading.value = false
  step.value = 3
}

// ── Descarga de plantilla ─────────────────────────────────────────────────────
/*
function downloadTemplate() {
  const headers = COLUMN_MAP.map((c) => c.aliases[0])
  const example = [
    '12345678',
    'Juan',
    'Pérez',
    '1123456789',
    'MiOrg',
    'Juancho',
    'juan@org.com',
    'juan@gmail.com',
    'Área A',
    'Rol X',
  ]
  const csv = [headers.join(','), example.join(',')].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'plantilla_alta_masiva.csv'
  a.click()
  URL.revokeObjectURL(url)
}
*/

// ── Reset ─────────────────────────────────────────────────────────────────────
function reset() {
  step.value = 1
  rows.value = []
  parseError.value = ''
  errorMessage.value = ''
  successMessage.value = ''
  uploadProgress.value = 0
  uploadResults.value = { success: [], failed: [] }
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<style scoped>
/* ── Dropzone ─────────────────────────────────────────────────── */
.dropzone {
  border: 2px dashed #ced4da;
  border-radius: 10px;
  padding: 2.5rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background-color 0.2s;
  background-color: #f8f9fa;
}
.dropzone:hover,
.dropzone--over {
  border-color: #0d6efd;
  background-color: #e7f1ff;
}
.dropzone--error {
  border-color: #dc3545;
  background-color: #fff5f5;
}
.dropzone__icon {
  font-size: 2.5rem;
  color: #6c757d;
  display: block;
  margin-bottom: 0.75rem;
}
.dropzone__title {
  font-size: 1rem;
  color: #495057;
  margin-bottom: 0.25rem;
}
.dropzone__link {
  color: #0d6efd;
  text-decoration: underline;
  cursor: pointer;
}
.dropzone__subtitle {
  font-size: 0.82rem;
  color: #adb5bd;
  margin-bottom: 0;
}

/* ── Info de columnas ─────────────────────────────────────────── */
.columns-info {
  background: #f1f3f5;
  border-radius: 8px;
  padding: 0.75rem 1rem;
}
.columns-info__title {
  font-size: 0.82rem;
  color: #495057;
  margin-bottom: 0.5rem;
}
.columns-info__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.column-tag {
  font-size: 0.75rem;
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
  font-family: monospace;
}
.column-tag--required {
  background: #cfe2ff;
  color: #084298;
}
.column-tag--optional {
  background: #e2e3e5;
  color: #41464b;
}

/* ── Preview summary ──────────────────────────────────────────── */
.preview-summary {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.preview-summary__stat {
  font-size: 0.88rem;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
}
.preview-summary__stat--total {
  background: #e9ecef;
  color: #343a40;
}
.preview-summary__stat--ok {
  background: #d1e7dd;
  color: #0f5132;
}
.preview-summary__stat--error {
  background: #f8d7da;
  color: #842029;
}

/* ── Tabla de preview ─────────────────────────────────────────── */
.preview-table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}
.preview-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 0.82rem;
  min-width: 900px;
}
.preview-table th {
  background: #f1f3f5;
  padding: 0.5rem 0.6rem;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
  border-bottom: 2px solid #dee2e6;
  position: sticky;
  top: 0;
  z-index: 1;
}
.preview-table th.col-required {
  background: #e8f0fe;
}
.preview-table td {
  padding: 0.3rem 0.4rem;
  vertical-align: top;
  border-bottom: 1px solid #f1f3f5;
}
.preview-table .col-row {
  width: 32px;
  text-align: center;
  font-size: 0.75rem;
}
.preview-table .col-status {
  white-space: nowrap;
  text-align: center;
}
.preview-table .row--error {
  background-color: #fff8f8;
}
.preview-table .row--ok {
  background-color: #f9fffa;
}

/* Inputs de celdas editables */
.cell-input {
  width: 100%;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 0.2rem 0.4rem;
  font-size: 0.82rem;
  background: transparent;
  transition:
    border-color 0.15s,
    background 0.15s;
  min-width: 80px;
}
.cell-input:hover,
.cell-input:focus {
  background: #fff;
  border-color: #0d6efd;
  outline: none;
}
.cell-input--error {
  border-color: #dc3545 !important;
  background: #fff !important;
}
.cell-error-msg {
  display: block;
  color: #dc3545;
  font-size: 0.7rem;
  margin-top: 0.1rem;
  white-space: nowrap;
}

/* ── Resultado final ──────────────────────────────────────────── */
.result-panel {
  padding: 0.5rem 0;
}
.result-block {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  align-items: flex-start;
}
.result-block--success {
  background: #d1e7dd;
  color: #0f5132;
}
.result-block--error {
  background: #f8d7da;
  color: #842029;
}
.result-block__icon {
  font-size: 1.4rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}
.result-list {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.85rem;
}
</style>
