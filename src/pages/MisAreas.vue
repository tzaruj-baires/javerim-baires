<template>
  <div class="container-fluid py-4">
    <div class="row">
      <div class="col-12">
        <h1 class="mb-4"><i class="bi bi-diagram-3"></i> Mis Áreas</h1>
        <button class="btn btn-secondary mb-3" @click="refreshPage">Actualizar datos</button>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2">Cargando datos de áreas...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="alert alert-danger">
          <i class="bi bi-exclamation-triangle"></i> {{ error }}
        </div>

        <!-- Contenido -->
        <div v-else>
          <!-- Secciones por organización -->
          <div v-for="(orgData, orgKey) in groupedUsers" :key="orgKey" class="mb-5">
            <hr class="my-4" />
            <h2 class="mb-3">{{ orgKey }}</h2>
            <!-- Acordeones por área dentro de la organización -->
            <div class="accordion" :id="`areasAccordion${orgKey.replace(/\s+/g, '_')}`">
              <div
                v-for="(areaData, areaKey) in orgData.areas"
                :key="`${orgKey}-${areaKey}`"
                class="accordion-item"
              >
                <h2 class="accordion-header">
                  <button
                    class="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    :data-bs-target="`#collapse${orgKey.replace(/\s+/g, '_')}-${areaKey.replace(/\s+/g, '_')}`"
                    aria-expanded="false"
                    :aria-controls="`collapse${orgKey.replace(/\s+/g, '_')}-${areaKey.replace(/\s+/g, '_')}`"
                  >
                    <strong>{{ areaData.area }}</strong>
                    <span class="badge bg-primary ms-2">{{ areaData.users.length }} usuarios</span>
                  </button>
                </h2>
                <div
                  :id="`collapse${orgKey.replace(/\s+/g, '_')}-${areaKey.replace(/\s+/g, '_')}`"
                  class="accordion-collapse collapse"
                  :data-bs-parent="`#areasAccordion${orgKey.replace(/\s+/g, '_')}`"
                >
                  <div class="accordion-body">
                    <!-- Gráficos de métricas -->
                    <div class="row mb-4">
                      <div class="col-md-6">
                        <div class="card">
                          <div class="card-header">
                            <h6 class="card-title mb-0">Estudios Médicos Certificado</h6>
                          </div>
                          <div class="card-body">
                            <canvas
                              :id="`chartMedicos${orgKey.replace(/\s+/g, '_')}-${areaKey.replace(/\s+/g, '_')}`"
                              width="300"
                              height="200"
                            ></canvas>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="card">
                          <div class="card-header">
                            <h6 class="card-title mb-0">Cursos Realizados</h6>
                          </div>
                          <div class="card-body">
                            <canvas
                              :id="`chartCursos${orgKey.replace(/\s+/g, '_')}-${areaKey.replace(/\s+/g, '_')}`"
                              width="300"
                              height="200"
                            ></canvas>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="row mb-4">
                      <div class="col-md-6">
                        <div class="card">
                          <div class="card-header">
                            <h6 class="card-title mb-0">Niveles HBTJ</h6>
                          </div>
                          <div class="card-body">
                            <canvas
                              :id="`chartNiveles${orgKey.replace(/\s+/g, '_')}-${areaKey.replace(/\s+/g, '_')}`"
                              width="300"
                              height="200"
                            ></canvas>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="card">
                          <div class="card-header">
                            <h6 class="card-title mb-0">Distribución Género / Edad</h6>
                          </div>
                          <div class="card-body">
                            <canvas
                              :id="`chartGeneral${orgKey.replace(/\s+/g, '_')}-${areaKey.replace(/\s+/g, '_')}`"
                              width="300"
                              height="200"
                            ></canvas>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Lista de usuarios -->
                    <h5>Usuarios en esta área:</h5>
                    <div class="table-responsive">
                      <table class="table table-striped">
                        <thead>
                          <tr>
                            <th>DNI</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Email</th>
                            <th>Organización</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="user in areaData.users" :key="user.DNI">
                            <td>{{ user.DNI }}</td>
                            <td>{{ user.nombre }}</td>
                            <td>{{ user.apellido }}</td>
                            <td>{{ user.mail_operativo || user.mail_personal }}</td>
                            <td>{{ user.organizacion }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getAll } from '@/services/api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PieController,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PieController,
)

const authStore = useAuthStore()
const loading = ref(true)
const error = ref(null)
const users = ref([])
const chartInstances = ref({})

// ── Sin cambios: agrupación de usuarios por org/área ──────────────────────────
const groupedUsers = computed(() => {
  const user = authStore.user
  if (!user) return {}

  const allUsers = users.value
  const groups = {}

  let allowedOrgs = []
  let allowedAreas = []

  if (user.it_level === 3) {
    allowedOrgs = [...new Set(allUsers.map((u) => u.organizacion).filter(Boolean))]
    allowedAreas = [
      ...new Set(allUsers.flatMap((u) => (u.areas ? u.areas.split(',').map((a) => a.trim()) : []))),
    ]
  } else if (user.it_level >= 2) {
    allowedOrgs = [user.organizacion]
    console.log('user.areas:', user.areas)
    if (
      user.areas &&
      user.areas
        .split(',')
        .map((a) => a.trim())
        .includes('ROSH')
    ) {
      allowedAreas = [
        ...new Set(
          allUsers
            .filter((u) => u.organizacion === user.organizacion)
            .flatMap((u) => (u.areas ? u.areas.split(',').map((a) => a.trim()) : [])),
        ),
      ]
    } else {
      const refAreas = user.areas_ref ? user.areas_ref.split(',').map((a) => a.trim()) : []
      allowedAreas = [
        ...new Set(
          allUsers
            .filter((u) => u.organizacion === user.organizacion)
            .flatMap((u) =>
              u.areas
                ? u.areas
                    .split(',')
                    .map((a) => a.trim())
                    .filter((a) => refAreas.some((r) => a.includes(r)))
                : [],
            ),
        ),
      ]
    }
  } else {
    return {}
  }

  allowedAreas.sort((a, b) => a.localeCompare(b))

  allowedOrgs.forEach((org) => {
    if (!groups[org]) {
      groups[org] = { areas: {} }
    }
    allowedAreas.forEach((area) => {
      const areaUsers = allUsers.filter(
        (u) =>
          u.organizacion === org &&
          u.areas &&
          u.areas
            .split(',')
            .map((a) => a.trim())
            .includes(area),
      )
      if (areaUsers.length > 0) {
        groups[org].areas[area] = {
          area,
          users: areaUsers,
        }
      }
    })
    const sortedAreas = Object.fromEntries(
      Object.entries(groups[org].areas).sort(([a], [b]) => a.localeCompare(b)),
    )
    groups[org].areas = sortedAreas
  })

  return groups
})

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Parsea fechas en múltiples formatos:
 *   - dd/mm/yyyy  (formato principal de la DB)
 *   - yyyy-mm-dd  (ISO, también frecuente)
 *   - d/m/yyyy, d/m/yy, etc.
 * Retorna null si no puede parsear.
 */
const parseFecha = (str) => {
  if (!str || typeof str !== 'string') return null
  const s = str.trim()
  if (!s) return null

  // Formato dd/mm/yyyy o d/m/yyyy (con separador / o -)
  const dmyMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/)
  if (dmyMatch) {
    let [, day, month, year] = dmyMatch.map(Number)
    if (year < 100) year += 2000
    const d = new Date(year, month - 1, day)
    if (!isNaN(d.getTime())) return d
  }

  // Formato yyyy-mm-dd (ISO)
  const isoMatch = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch.map(Number)
    const d = new Date(year, month - 1, day)
    if (!isNaN(d.getTime())) return d
  }

  // Fallback: dejar que Date lo intente
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Calcula la edad en años completos a partir de una fecha de nacimiento.
 * Acepta cualquier formato que parseFecha entienda.
 */
const calcularEdad = (nacimiento) => {
  if (!nacimiento) return null
  const birth = parseFecha(String(nacimiento)) || new Date(nacimiento)
  if (!birth || isNaN(birth.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1
  return age >= 0 ? age : null
}

/**
 * Devuelve true si el valor representa "no hizo el curso"
 * (null, undefined, vacío, o variante de "no").
 */
const esNoCurso = (val) => {
  if (val === null || val === undefined) return true
  const s = val.toString().trim().toLowerCase()
  return s === '' || s === 'no'
}

// ── Métricas ──────────────────────────────────────────────────────────────────

const calculateMetrics = (areaUsers) => {
  const now = new Date()
  const MS_POR_DIA = 1000 * 60 * 60 * 24
  const MS_30_DIAS = 30 * MS_POR_DIA

  // 1. Estudios médicos ---------------------------------------------------------
  const medStatus = { alDia: 0, porVencer: 0, vencido: 0 }

  // DEBUG
  if (areaUsers.length > 0) {
    console.log(
      '[Médicos debug] med_estudios_fecha del primer usuario:',
      areaUsers[0].med_estudios_fecha,
    )
    console.log(
      '[Médicos debug] Fecha parseada:',
      parseFecha(String(areaUsers[0].med_estudios_fecha ?? '')),
    )
  }

  areaUsers.forEach((u) => {
    const raw = u.med_estudios_fecha
    // Sin fecha, vacío o null → vencido
    if (!raw || String(raw).trim() === '') {
      medStatus.vencido += 1
      return
    }
    const fechaExamen = parseFecha(String(raw))
    if (!fechaExamen) {
      // Sin fecha → vencido
      medStatus.vencido += 1
      return
    }
    // Vencimiento = fecha del examen + 1 año exacto
    const vencimiento = new Date(
      fechaExamen.getFullYear() + 1,
      fechaExamen.getMonth(),
      fechaExamen.getDate(),
    )
    const msRestantes = vencimiento - now
    if (msRestantes < 0) {
      medStatus.vencido += 1
    } else if (msRestantes <= MS_30_DIAS) {
      medStatus.porVencer += 1
    } else {
      medStatus.alDia += 1
    }
  })

  // 2. Cursos -------------------------------------------------------------------
  // Mapeo label → nombre exacto de columna en la DB
  const cursoColumnas = {
    CB: 'CBok',
    TL: 'curso_TL',
    'Av. H': 'curso_AvH',
    'Av. KM': 'curso_AvKM',
    IE: 'curso_IE',
    FND: 'curso_FND',
  }

  // DEBUG: mostrar las claves reales que trae el primer usuario para verificar nombres de columna
  if (areaUsers.length > 0) {
    console.log('[Cursos debug] Claves del primer usuario:', Object.keys(areaUsers[0]))
    console.log('[Cursos debug] Valores de curso del primer usuario:', {
      CBok: areaUsers[0].CBok,
      curso_TL: areaUsers[0].curso_TL,
      curso_AvH: areaUsers[0].curso_AvH,
      curso_AvKM: areaUsers[0].curso_AvKM,
      curso_IE: areaUsers[0].curso_IE,
      curso_FND: areaUsers[0].curso_FND,
    })
  }

  const cursosPorTipo = {}
  Object.entries(cursoColumnas).forEach(([label, col]) => {
    const count = areaUsers.filter((u) => {
      // Buscar la columna de forma exacta; si no existe en el objeto, tratar como vacío
      const val = Object.prototype.hasOwnProperty.call(u, col) ? u[col] : undefined
      return !esNoCurso(val)
    }).length
    if (count > 0) cursosPorTipo[label] = count
  })

  // 3. Niveles HBTJ -------------------------------------------------------------
  const nivelesHbtj = {}
  areaUsers.forEach((u) => {
    const nivel = (u.nivelHBTJ && u.nivelHBTJ.toString().trim()) || 'Sin definir'
    nivelesHbtj[nivel] = (nivelesHbtj[nivel] || 0) + 1
  })

  // 4. Distribución género/edad (pirámide) --------------------------------------
  //    Estructura: { rangoLabel: { M: n, F: n } }
  const ageDist = {}

  areaUsers.forEach((u) => {
    const edad = calcularEdad(u.nacimiento)
    if (edad === null) return

    const rangoInicio = Math.floor(edad / 5) * 5
    const rangoLabel = `${rangoInicio}-${rangoInicio + 4}`

    if (!ageDist[rangoLabel]) ageDist[rangoLabel] = { M: 0, F: 0, inicio: rangoInicio }

    if (u.genero === 'Masculino') ageDist[rangoLabel].M += 1
    else if (u.genero === 'Femenino') ageDist[rangoLabel].F += 1
  })

  return { medStatus, cursosPorTipo, nivelesHbtj, ageDist }
}

// ── Creación de gráficos ──────────────────────────────────────────────────────

const destroyChart = (id) => {
  if (chartInstances.value[id]) {
    chartInstances.value[id].destroy()
    delete chartInstances.value[id]
  }
}

/**
 * Crea los 4 gráficos de UN área específica.
 * Solo debe llamarse cuando el acordeón ya está abierto y los canvas tienen ancho real.
 */
const createChartsForArea = (orgKey, areaKey) => {
  const orgData = groupedUsers.value[orgKey]
  if (!orgData) return
  const areaData = orgData.areas[areaKey]
  if (!areaData) return

  const sOrg = orgKey.replace(/\s+/g, '_')
  const sArea = areaKey.replace(/\s+/g, '_')
  const metrics = calculateMetrics(areaData.users)

  // ── 1. Estudios médicos (pie) ────────────────────────────────────────────
  const idMed = `chartMedicos${sOrg}-${sArea}`
  const ctxMed = document.getElementById(idMed)
  if (ctxMed && ctxMed.offsetWidth > 0) {
    destroyChart(idMed)
    const { alDia, porVencer, vencido } = metrics.medStatus
    chartInstances.value[idMed] = new ChartJS(ctxMed, {
      type: 'pie',
      data: {
        labels: ['Al día', 'Por vencer', 'Vencido'],
        datasets: [
          {
            data: [alDia, porVencer, vencido],
            backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed} personas` } },
        },
      },
    })
  }

  // ── 2. Cursos (pie) ──────────────────────────────────────────────────────
  const idCursos = `chartCursos${sOrg}-${sArea}`
  const ctxCursos = document.getElementById(idCursos)
  if (ctxCursos && ctxCursos.offsetWidth > 0) {
    destroyChart(idCursos)
    const labels = Object.keys(metrics.cursosPorTipo)
    const data = Object.values(metrics.cursosPorTipo)

    if (labels.length === 0) {
      chartInstances.value[idCursos] = new ChartJS(ctxCursos, {
        type: 'pie',
        data: {
          labels: ['Sin cursos registrados'],
          datasets: [{ data: [1], backgroundColor: ['#dee2e6'] }],
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } },
      })
    } else {
      chartInstances.value[idCursos] = new ChartJS(ctxCursos, {
        type: 'pie',
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: ['#007bff', '#6610f2', '#6f42c1', '#e83e8c', '#fd7e14', '#20c997'],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed} personas` } },
          },
        },
      })
    }
  }

  // ── 3. Niveles HBTJ (pie) ────────────────────────────────────────────────
  const idNiveles = `chartNiveles${sOrg}-${sArea}`
  const ctxNiveles = document.getElementById(idNiveles)
  if (ctxNiveles && ctxNiveles.offsetWidth > 0) {
    destroyChart(idNiveles)
    chartInstances.value[idNiveles] = new ChartJS(ctxNiveles, {
      type: 'pie',
      data: {
        labels: Object.keys(metrics.nivelesHbtj),
        datasets: [
          {
            data: Object.values(metrics.nivelesHbtj),
            backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#ff9f40', '#4bc0c0'],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed} personas` } },
        },
      },
    })
  }

  // ── 4. Pirámide poblacional (barras horizontales) ────────────────────────
  const idGeneral = `chartGeneral${sOrg}-${sArea}`
  const ctxGeneral = document.getElementById(idGeneral)
  if (ctxGeneral && ctxGeneral.offsetWidth > 0) {
    destroyChart(idGeneral)
    const rangos = Object.values(metrics.ageDist)

    if (rangos.length === 0) {
      chartInstances.value[idGeneral] = new ChartJS(ctxGeneral, {
        type: 'bar',
        data: {
          labels: ['Sin datos'],
          datasets: [
            { label: 'Hombres', data: [0], backgroundColor: '#36a2eb' },
            { label: 'Mujeres', data: [0], backgroundColor: '#ff6384' },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          plugins: { legend: { position: 'bottom' } },
        },
      })
    } else {
      // Ordenar ascendente y luego invertir → los más jóvenes quedan abajo en el gráfico
      const rangos = Object.values(metrics.ageDist).sort((a, b) => b.inicio - a.inicio) // de mayor a menor (Chart.js dibuja de arriba a abajo)

      const labels = rangos.map((r) => `${r.inicio}-${r.inicio + 4}`)
      // Hombres negativos (izquierda), Mujeres positivos (derecha)
      // Ambos datasets en el mismo eje Y con stack independiente por dataset
      const hombres = rangos.map((r) => -r.M)
      const mujeres = rangos.map((r) => r.F)
      const maxVal = Math.max(...rangos.map((r) => Math.max(r.M, r.F)), 1)

      chartInstances.value[idGeneral] = new ChartJS(ctxGeneral, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Hombres',
              data: hombres,
              backgroundColor: '#36a2eb',
              borderWidth: 1,
              // Stack propio → ocupa toda la altura de la fila, sin desplazarse
              stack: 'hombres',
              barPercentage: 0.9,
              categoryPercentage: 1.0,
            },
            {
              label: 'Mujeres',
              data: mujeres,
              backgroundColor: '#ff6384',
              borderWidth: 1,
              stack: 'mujeres',
              barPercentage: 0.9,
              categoryPercentage: 1.0,
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          scales: {
            x: {
              stacked: true,
              min: -(maxVal + 1),
              max: maxVal + 1,
              ticks: { callback: (v) => Math.abs(v) },
              grid: {
                color: (ctx) => (ctx.tick.value === 0 ? '#444' : '#e0e0e0'),
                lineWidth: (ctx) => (ctx.tick.value === 0 ? 2 : 1),
              },
            },
            y: { stacked: true },
          },
          plugins: {
            legend: { position: 'bottom' },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: ${Math.abs(ctx.parsed.x)} personas`,
              },
            },
          },
        },
      })
    }
  }
}

/**
 * Recorre todos los acordeones y dibuja solo los que ya están abiertos (tienen clase 'show').
 * Se llama al cargar datos y cuando cambia groupedUsers.
 */
const createCharts = async () => {
  await nextTick()
  Object.keys(groupedUsers.value).forEach((orgKey) => {
    const orgData = groupedUsers.value[orgKey]
    Object.keys(orgData.areas).forEach((areaKey) => {
      const sOrg = orgKey.replace(/\s+/g, '_')
      const sArea = areaKey.replace(/\s+/g, '_')
      const collapseEl = document.getElementById(`collapse${sOrg}-${sArea}`)
      if (collapseEl && collapseEl.classList.contains('show')) {
        createChartsForArea(orgKey, areaKey)
      }
    })
  })
}

// ── Carga de datos (sin cambios) ──────────────────────────────────────────────

const loadData = async () => {
  try {
    loading.value = true
    const response = await getAll('main')
    users.value = response.data || []
    await createCharts()
  } catch (err) {
    error.value = 'Error al cargar los datos: ' + err.message
  } finally {
    loading.value = false
  }
}

const refreshData = async () => {
  try {
    await authStore.refreshUser()
    await loadData()
  } catch (e) {
    console.error('Error al actualizar datos:', e)
  }
}

onMounted(async () => {
  // Registrar el listener ANTES de cargar datos para no perder el primer evento
  document.addEventListener('shown.bs.collapse', (event) => {
    const collapseEl = event.target
    if (!collapseEl) return

    const id = collapseEl.id
    if (!id.startsWith('collapse')) return

    const rest = id.slice('collapse'.length)
    const dashIdx = rest.indexOf('-')
    if (dashIdx === -1) return
    const sOrg = rest.slice(0, dashIdx)
    const sArea = rest.slice(dashIdx + 1)

    const orgKey = Object.keys(groupedUsers.value).find((k) => k.replace(/\s+/g, '_') === sOrg)
    if (!orgKey) return
    const orgData = groupedUsers.value[orgKey]
    const areaKey = Object.keys(orgData.areas).find((k) => k.replace(/\s+/g, '_') === sArea)
    if (!areaKey) return

    // Sin setTimeout: shown.bs.collapse ya garantiza que el panel es visible
    createChartsForArea(orgKey, areaKey)
  })

  await loadData()

  if (authStore.isAuthenticated) {
    try {
      await authStore.refreshUser()
    } catch (e) {
      console.error('Error al refrescar usuario:', e)
    }
  }
})

watch(groupedUsers, () => {
  createCharts()
})
</script>

<style scoped>
.accordion-button {
  font-weight: 600;
}

.badge {
  font-size: 0.8em;
}

.card {
  margin-bottom: 1rem;
}

.table th {
  background-color: #f8f9fa;
}

canvas {
  max-width: 100% !important;
  max-height: 250px !important;
}
</style>
