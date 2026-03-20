<template>
  <div class="am">
    <!-- Alertas globales -->
    <div v-if="successMessage" class="jv-alert jv-alert--success am-alert">
      <i class="bi bi-check-circle"></i> {{ successMessage }}
      <button class="jv-alert__close" @click="successMessage = ''">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
    <div v-if="errorMessage" class="jv-alert jv-alert--danger am-alert">
      <i class="bi bi-exclamation-circle"></i> {{ errorMessage }}
      <button class="jv-alert__close" @click="errorMessage = ''"><i class="bi bi-x-lg"></i></button>
    </div>

    <!-- ── PASO 1: Carga de archivo ── -->
    <div v-if="step === 1">
      <!-- Plantilla -->
      <div class="am-template-row">
        <span class="am-step-label"><i class="bi bi-upload"></i> Subí tu archivo</span>
        <a
          href="https://docs.google.com/spreadsheets/d/1lIDendDqH6KhctatcfFfZrsMCIIbHw9_gNmKap_hlJE/template/preview"
          target="_blank"
          class="jv-btn jv-btn--ghost jv-btn--sm"
        >
          <i class="bi bi-table"></i> Usar plantilla
        </a>
      </div>

      <!-- Dropzone -->
      <div
        class="am-dropzone"
        :class="{ 'am-dropzone--over': isDragging, 'am-dropzone--error': parseError }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
        @click="triggerFileInput"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".csv,.xlsx,.xls"
          style="display: none"
          @change="onFileChange"
        />
        <div class="am-dropzone__body">
          <i class="bi bi-cloud-upload am-dropzone__icon"></i>
          <p class="am-dropzone__title">
            Arrastrá tu archivo acá o <span class="am-dropzone__link">hacé clic para elegir</span>
          </p>
          <p class="am-dropzone__sub">CSV, Excel (.xlsx, .xls) — máx. 5 MB</p>
          <p v-if="parseError" class="am-dropzone__error">
            <i class="bi bi-exclamation-circle"></i> {{ parseError }}
          </p>
        </div>
      </div>

      <!-- Info de columnas -->
      <div class="am-columns-info">
        <p class="am-columns-info__title">
          <i class="bi bi-info-circle"></i> Columnas reconocidas (el orden no importa):
        </p>
        <div class="am-columns-info__tags">
          <span
            v-for="col in COLUMN_MAP_DISPLAY"
            :key="col.key"
            class="am-col-tag"
            :class="col.required ? 'am-col-tag--required' : 'am-col-tag--optional'"
          >
            {{ col.label }}<span v-if="col.required" class="am-required">*</span>
          </span>
        </div>
      </div>
    </div>

    <!-- ── PASO 2: Previsualización ── -->
    <div v-if="step === 2">
      <!-- Resumen -->
      <div class="am-summary">
        <div class="am-summary__stat am-summary__stat--total">
          <i class="bi bi-people-fill"></i>
          <strong>{{ rows.length }}</strong> fila(s)
        </div>
        <div v-if="validRows > 0" class="am-summary__stat am-summary__stat--ok">
          <i class="bi bi-check-circle-fill"></i>
          <strong>{{ validRows }}</strong> válidas
        </div>
        <div v-if="invalidRows > 0" class="am-summary__stat am-summary__stat--error">
          <i class="bi bi-x-circle-fill"></i>
          <strong>{{ invalidRows }}</strong> con errores
        </div>
      </div>

      <!-- Tabla editable -->
      <div class="am-table-wrap">
        <table class="am-table">
          <thead>
            <tr>
              <th class="am-th-num">#</th>
              <th
                v-for="col in COLUMN_MAP_DISPLAY"
                :key="col.key"
                :class="{ 'am-th-required': col.required }"
              >
                {{ col.label }}<span v-if="col.required" class="am-required">*</span>
              </th>
              <th class="am-th-status">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in rows"
              :key="idx"
              :class="rowHasError(row) ? 'am-tr--error' : 'am-tr--ok'"
            >
              <td class="am-td-num">{{ idx + 1 }}</td>
              <td
                v-for="col in COLUMN_MAP_DISPLAY"
                :key="col.key"
                :class="{ 'am-td--error': row._errors && row._errors[col.key] }"
              >
                <input
                  class="am-cell-input"
                  :class="{ 'am-cell-input--error': row._errors && row._errors[col.key] }"
                  v-model="row[col.key]"
                  :placeholder="col.label"
                  @input="revalidateRow(row, idx)"
                  @blur="revalidateRow(row, idx)"
                />
                <small v-if="row._errors && row._errors[col.key]" class="am-cell-error">
                  {{ row._errors[col.key] }}
                </small>
              </td>
              <td class="am-td-status">
                <span v-if="!rowHasError(row)" class="am-badge am-badge--ok">
                  <i class="bi bi-check-lg"></i> OK
                </span>
                <span v-else class="am-badge am-badge--error">
                  <i class="bi bi-x-lg"></i> Error
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Nota errores -->
      <p v-if="invalidRows > 0" class="am-error-note">
        <i class="bi bi-pencil-square"></i> Corregí los errores en la tabla antes de continuar.
        Podés editar las celdas directamente.
      </p>

      <!-- Acciones -->
      <div class="am-step-actions">
        <button class="jv-btn jv-btn--ghost" @click="reset">
          <i class="bi bi-arrow-left"></i> Volver
        </button>
        <button
          class="jv-btn jv-btn--primary"
          :disabled="invalidRows > 0 || isLoading"
          @click="handleBulkSubmit"
          style="margin-left: auto"
        >
          <span v-if="!isLoading">
            <i class="bi bi-people-fill"></i> Dar de alta {{ validRows }} persona(s)
          </span>
          <span v-else class="am-loading">
            <span class="jv-spinner jv-spinner--sm jv-spinner--white"></span>
            Registrando... ({{ uploadProgress }}/{{ rows.length }})
          </span>
        </button>
      </div>
    </div>

    <!-- ── PASO 3: Resultado ── -->
    <div v-if="step === 3" class="am-result">
      <div v-if="uploadResults.success.length > 0" class="am-result-block am-result-block--success">
        <i class="bi bi-check-circle-fill am-result-block__icon"></i>
        <div>
          <strong>{{ uploadResults.success.length }} persona(s) dadas de alta correctamente</strong>
          <ul class="am-result-list">
            <li v-for="r in uploadResults.success" :key="r.DNI">
              {{ r.nombre }} {{ r.apellido }} — DNI {{ r.DNI }}
            </li>
          </ul>
        </div>
      </div>
      <div v-if="uploadResults.failed.length > 0" class="am-result-block am-result-block--error">
        <i class="bi bi-x-circle-fill am-result-block__icon"></i>
        <div>
          <strong>{{ uploadResults.failed.length }} persona(s) no pudieron darse de alta</strong>
          <ul class="am-result-list">
            <li v-for="r in uploadResults.failed" :key="r.DNI">
              {{ r.nombre }} {{ r.apellido }} — {{ r.reason }}
            </li>
          </ul>
        </div>
      </div>
      <button class="jv-btn jv-btn--primary" style="margin-top: 1.25rem" @click="reset">
        <i class="bi bi-arrow-clockwise"></i> Cargar otro archivo
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import * as api from '@/services/api'

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

const step = ref(1)
const isDragging = ref(false)
const parseError = ref('')
const fileInput = ref(null)
const rows = ref([])
const isLoading = ref(false)
const uploadProgress = ref(0)
const successMessage = ref('')
const errorMessage = ref('')
const uploadResults = ref({ success: [], failed: [] })

const validRows = computed(() => rows.value.filter((r) => !rowHasError(r)).length)
const invalidRows = computed(() => rows.value.filter((r) => rowHasError(r)).length)

function normalizeHeader(h) {
  return h.toString().toLowerCase().trim().replace(/\s+/g, ' ')
}

function resolveKey(rawHeader) {
  const normalized = normalizeHeader(rawHeader)
  for (const col of COLUMN_MAP) {
    if (col.aliases.some((a) => a === normalized)) return col.key
  }
  return null
}

function arraysToObjects(data) {
  if (data.length < 2) return []
  const headers = data[0]
  const keyMap = headers.map((h) => resolveKey(h))

  return data
    .slice(1)
    .map((rowArr) => {
      const obj = {}
      keyMap.forEach((key, i) => {
        if (key) obj[key] = rowArr[i] !== undefined ? String(rowArr[i]).trim() : ''
      })
      COLUMN_MAP.forEach((col) => {
        if (!(col.key in obj)) obj[col.key] = ''
      })
      return obj
    })
    .filter((row) => {
      return COLUMN_MAP.some((col) => row[col.key] !== '')
    })
}

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

async function parseExcel(file) {
  return new Promise((resolve, reject) => {
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateRow(row, existingDNIs, batchDNIs) {
  const errors = {}

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

  if (!String(row.nombre || '').trim()) errors.nombre = 'Requerido'
  if (!String(row.apellido || '').trim()) errors.apellido = 'Requerido'
  if (!String(row.celular || '').trim()) errors.celular = 'Requerido'
  if (!String(row.organizacion || '').trim()) errors.organizacion = 'Requerida'

  const mo = String(row.mailOperativo || '').trim()
  if (mo && !EMAIL_REGEX.test(mo)) errors.mailOperativo = 'Email inválido'
  const mp = String(row.mailPersonal || '').trim()
  if (mp && !EMAIL_REGEX.test(mp)) errors.mailPersonal = 'Email inválido'

  return errors
}

function rowHasError(row) {
  return row._errors && Object.keys(row._errors).length > 0
}

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

  let existingDNIs = new Set()
  try {
    const res = await api.getAll('main')
    existingDNIs = new Set((res.data || []).map((r) => String(r.DNI).trim()))
  } catch (e) {
    errorMessage.value = 'No se pudo conectar con la base de datos para verificar duplicados'
  }

  const seenDNIs = new Set()
  const batchDNIs = new Set()
  parsed.forEach((row) => {
    const d = String(row.dni || '').trim()
    if (d) {
      if (seenDNIs.has(d)) batchDNIs.add(d)
      else seenDNIs.add(d)
    }
  })

  rows.value = parsed.map((row) => ({
    ...row,
    _errors: validateRow(row, existingDNIs, batchDNIs),
  }))

  step.value = 2
}

function revalidateRow(row, _idx) {
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

  row._errors = validateRow(row, new Set(), batchDNIs)
}

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
@import '@/assets/css/styles.css';

.am {
  font-family: var(--jv-font);
}

.am-alert {
  margin-bottom: 1rem;
  font-size: 0.85rem;
}

/* ── Template row ── */
.am-template-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
}

.am-step-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--jv-text-muted);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

/* ── Dropzone ── */
.am-dropzone {
  border: 2px dashed var(--jv-border);
  border-radius: var(--jv-radius);
  padding: 2.5rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
  background: #f8fafc;
}

.am-dropzone:hover,
.am-dropzone--over {
  border-color: var(--jv-accent);
  background: #eef2ff;
}

.am-dropzone--error {
  border-color: var(--jv-danger);
  background: #fef2f2;
}

.am-dropzone__body {
  pointer-events: none;
}

.am-dropzone__icon {
  font-size: 2.5rem;
  color: var(--jv-text-muted);
  display: block;
  margin-bottom: 0.75rem;
}

.am-dropzone--over .am-dropzone__icon,
.am-dropzone:hover .am-dropzone__icon {
  color: var(--jv-accent);
}

.am-dropzone__title {
  font-size: 0.95rem;
  color: var(--jv-text);
  margin-bottom: 0.25rem;
}

.am-dropzone__link {
  color: var(--jv-accent);
  text-decoration: underline;
  pointer-events: auto;
}

.am-dropzone__sub {
  font-size: 0.8rem;
  color: var(--jv-text-muted);
  margin: 0;
}

.am-dropzone__error {
  font-size: 0.82rem;
  color: var(--jv-danger);
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}

/* ── Column info ── */
.am-columns-info {
  background: #f8fafc;
  border: 1px solid var(--jv-border);
  border-radius: 9px;
  padding: 0.75rem 1rem;
  margin-top: 1rem;
}

.am-columns-info__title {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--jv-text-muted);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.am-columns-info__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.am-col-tag {
  font-size: 0.72rem;
  padding: 0.18rem 0.55rem;
  border-radius: 20px;
  font-family: 'Courier New', monospace;
}

.am-col-tag--required {
  background: #dbeafe;
  color: #1e40af;
}
.am-col-tag--optional {
  background: #f1f5f9;
  color: #475569;
}

.am-required {
  color: var(--jv-danger);
  font-weight: 700;
  margin-left: 2px;
}

/* ── Summary ── */
.am-summary {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.am-summary__stat {
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.am-summary__stat--total {
  background: #f1f5f9;
  color: #374151;
}
.am-summary__stat--ok {
  background: #dcfce7;
  color: #166534;
}
.am-summary__stat--error {
  background: #fee2e2;
  color: #991b1b;
}

/* ── Preview table ── */
.am-table-wrap {
  overflow-x: auto;
  border-radius: 9px;
  border: 1px solid var(--jv-border);
  -webkit-overflow-scrolling: touch;
}

.am-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 0.82rem;
  min-width: 900px;
}

.am-table th {
  background: #f8fafc;
  padding: 0.55rem 0.6rem;
  text-align: left;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--jv-text-muted);
  white-space: nowrap;
  border-bottom: 1px solid var(--jv-border);
  position: sticky;
  top: 0;
  z-index: 1;
}

.am-th-required {
  background: #eef2ff;
  color: var(--jv-accent);
}
.am-th-num,
.am-th-status {
  width: 40px;
  text-align: center;
}

.am-table td {
  padding: 0.3rem 0.4rem;
  vertical-align: top;
  border-bottom: 1px solid #f1f5f9;
}

.am-td-num {
  text-align: center;
  color: var(--jv-text-muted);
  font-size: 0.72rem;
}
.am-td-status {
  text-align: center;
  white-space: nowrap;
}
.am-td--error {
  background: #fff8f8;
}

.am-tr--error {
  background: #fffafa;
}
.am-tr--ok:hover {
  background: #fafffe;
}

/* Editable cell inputs */
.am-cell-input {
  width: 100%;
  border: 1px solid transparent;
  border-radius: 5px;
  padding: 0.2rem 0.4rem;
  font-size: 0.82rem;
  background: transparent;
  transition:
    border-color 0.15s,
    background 0.15s;
  min-width: 80px;
  font-family: var(--jv-font);
  color: var(--jv-text);
}

.am-cell-input:hover,
.am-cell-input:focus {
  background: white;
  border-color: var(--jv-accent);
  outline: none;
}

.am-cell-input--error {
  border-color: var(--jv-danger) !important;
  background: white !important;
}

.am-cell-error {
  display: block;
  color: var(--jv-danger);
  font-size: 0.68rem;
  margin-top: 0.1rem;
  white-space: nowrap;
}

/* Status badges */
.am-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
}

.am-badge--ok {
  background: #dcfce7;
  color: #166534;
}
.am-badge--error {
  background: #fee2e2;
  color: #991b1b;
}

/* Error note */
.am-error-note {
  font-size: 0.8rem;
  color: var(--jv-danger);
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

/* Step actions */
.am-step-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.25rem;
}

.am-loading {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

/* ── Result ── */
.am-result {
  padding: 0.25rem 0;
}

.am-result-block {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 9px;
  align-items: flex-start;
}

.am-result-block + .am-result-block {
  margin-top: 0.75rem;
}

.am-result-block--success {
  background: #dcfce7;
  color: #166534;
}
.am-result-block--error {
  background: #fee2e2;
  color: #991b1b;
}

.am-result-block__icon {
  font-size: 1.4rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.am-result-list {
  margin: 0.35rem 0 0;
  padding-left: 1.2rem;
  font-size: 0.82rem;
}
</style>
