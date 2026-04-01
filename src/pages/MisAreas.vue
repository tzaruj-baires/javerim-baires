<template>
  <div class="ma">
    <!-- ── Header ── -->
    <div class="ma__header">
      <div class="ma__header-left">
        <div class="ma__header-icon"><i class="bi bi-diagram-3"></i></div>
        <div>
          <p class="ma__eyebrow">Panel de gestión</p>
          <h1 class="ma__title">Mis Áreas</h1>
        </div>
      </div>
      <button class="ma__refresh-btn" @click="refreshData" :disabled="loading">
        <i class="bi bi-arrow-clockwise" :class="{ ma__spin: loading }"></i>
        <span>Actualizar</span>
      </button>
    </div>

    <!-- ── Loading ── -->
    <div v-if="loading" class="ma__loading">
      <span class="ma__spinner"></span>
      <span>Cargando datos de áreas...</span>
    </div>

    <!-- ── Error ── -->
    <div v-else-if="error" class="ma__alert">
      <i class="bi bi-exclamation-triangle"></i>
      {{ error }}
    </div>

    <!-- ── Contenido ── -->
    <div v-else>
      <div v-for="(orgData, orgKey) in groupedUsers" :key="orgKey" class="ma__org-block">
        <!-- Org header -->
        <div class="ma__org-header">
          <span class="ma__org-icon"><i class="bi bi-building"></i></span>
          <h2 class="ma__org-title">{{ orgKey }}</h2>
          <span class="ma__org-count">
            {{ Object.keys(orgData.areas).length }} área{{
              Object.keys(orgData.areas).length !== 1 ? 's' : ''
            }}
          </span>
        </div>

        <!-- Acordeones de áreas -->
        <div class="ma__areas">
          <div
            v-for="(areaData, areaKey) in orgData.areas"
            :key="`${orgKey}-${areaKey}`"
            class="ma__area-item"
            :id="`item-${orgKey.replace(/\s+/g, '_')}-${areaKey.replace(/\s+/g, '_')}`"
          >
            <!-- Trigger -->
            <button
              type="button"
              class="ma__area-trigger"
              :class="{ 'ma__area-trigger--open': openAreas[`${orgKey}-${areaKey}`] }"
              @click="toggleArea(orgKey, areaKey)"
            >
              <span class="ma__area-trigger-left">
                <span class="ma__area-dot"></span>
                <strong>{{ areaData.area }}</strong>
              </span>
              <span class="ma__area-trigger-right">
                <span class="ma__user-count">
                  <i class="bi bi-people"></i>
                  {{ areaData.users.length }}
                </span>
                <i
                  class="bi bi-chevron-down ma__chevron"
                  :class="{ 'ma__chevron--open': openAreas[`${orgKey}-${areaKey}`] }"
                ></i>
              </span>
            </button>

            <!-- Collapse panel -->
            <div
              class="ma__area-body"
              :id="`collapse${orgKey.replace(/\s+/g, '_')}-${areaKey.replace(/\s+/g, '_')}`"
              v-show="openAreas[`${orgKey}-${areaKey}`]"
            >
              <!-- Gráficos -->
              <div class="ma__charts">
                <div class="ma__chart-card">
                  <div class="ma__chart-title">
                    <span class="ma__chart-dot ma__chart-dot--red"></span>
                    Estudios Médicos
                  </div>
                  <canvas
                    :id="`chartMedicos${orgKey.replace(/\s+/g, '_')}-${areaKey.replace(/\s+/g, '_')}`"
                  ></canvas>
                </div>
                <div class="ma__chart-card">
                  <div class="ma__chart-title">
                    <span class="ma__chart-dot ma__chart-dot--blue"></span>
                    Cursos Realizados
                  </div>
                  <canvas
                    :id="`chartCursos${orgKey.replace(/\s+/g, '_')}-${areaKey.replace(/\s+/g, '_')}`"
                  ></canvas>
                </div>
                <div class="ma__chart-card">
                  <div class="ma__chart-title">
                    <span class="ma__chart-dot ma__chart-dot--purple"></span>
                    Niveles HBTJ
                  </div>
                  <canvas
                    :id="`chartNiveles${orgKey.replace(/\s+/g, '_')}-${areaKey.replace(/\s+/g, '_')}`"
                  ></canvas>
                </div>
                <div class="ma__chart-card">
                  <div class="ma__chart-title">
                    <span class="ma__chart-dot ma__chart-dot--teal"></span>
                    Distribución Género / Edad
                  </div>
                  <canvas
                    :id="`chartGeneral${orgKey.replace(/\s+/g, '_')}-${areaKey.replace(/\s+/g, '_')}`"
                  ></canvas>
                </div>
              </div>

              <!-- Tabla de usuarios -->
              <div class="ma__table-section">
                <h3 class="ma__table-heading">
                  <i class="bi bi-people"></i> Usuarios en esta área
                </h3>
                <div class="ma__table-wrap">
                  <table class="ma__table">
                    <thead>
                      <tr>
                        <th>DNI</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Email</th>
                        <th class="ma__th--hide-sm">Organización</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="user in areaData.users" :key="user.DNI" class="ma__tr">
                        <td class="ma__td--mono">{{ user.DNI }}</td>
                        <td>{{ user.nombre }}</td>
                        <td>{{ user.apellido }}</td>
                        <td class="ma__td--email">
                          <a
                            v-if="user.mail_operativo || user.mail_personal"
                            :href="`mailto:${user.mail_operativo || user.mail_personal}`"
                            class="ma__link"
                          >
                            {{ user.mail_operativo || user.mail_personal }}
                          </a>
                          <span v-else>—</span>
                        </td>
                        <td class="ma__th--hide-sm">{{ user.organizacion }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sin áreas -->
      <div v-if="Object.keys(groupedUsers).length === 0" class="ma__empty">
        <i class="bi bi-inbox"></i>
        <p>No hay áreas disponibles para tu nivel de acceso.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch, reactive } from 'vue'
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

// Estado de acordeones custom
const openAreas = reactive({})

/**
 * Abre/cierra un área. Al abrir, dispara el evento shown.bs.collapse
 * sobre el elemento del panel para que la lógica de gráficos funcione igual.
 */
const toggleArea = async (orgKey, areaKey) => {
  const key = `${orgKey}-${areaKey}`
  openAreas[key] = !openAreas[key]

  if (openAreas[key]) {
    await nextTick()
    // Disparar el mismo evento que Bootstrap dispara al abrir un collapse
    const sOrg = orgKey.replace(/\s+/g, '_')
    const sArea = areaKey.replace(/\s+/g, '_')
    const collapseEl = document.getElementById(`collapse${sOrg}-${sArea}`)
    if (collapseEl) {
      // Añadir clase 'show' para que createCharts() lo encuentre
      collapseEl.classList.add('show')
      const event = new Event('shown.bs.collapse', { bubbles: true })
      collapseEl.dispatchEvent(event)
    }
  } else {
    const sOrg = orgKey.replace(/\s+/g, '_')
    const sArea = areaKey.replace(/\s+/g, '_')
    const collapseEl = document.getElementById(`collapse${sOrg}-${sArea}`)
    if (collapseEl) collapseEl.classList.remove('show')
  }
}

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

const parseFecha = (str) => {
  if (!str || typeof str !== 'string') return null
  const s = str.trim()
  if (!s) return null

  const dmyMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/)
  if (dmyMatch) {
    let [, day, month, year] = dmyMatch.map(Number)
    if (year < 100) year += 2000
    const d = new Date(year, month - 1, day)
    if (!isNaN(d.getTime())) return d
  }

  const isoMatch = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch.map(Number)
    const d = new Date(year, month - 1, day)
    if (!isNaN(d.getTime())) return d
  }

  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

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

  const medStatus = { alDia: 0, porVencer: 0, vencido: 0 }

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
    if (!raw || String(raw).trim() === '') {
      medStatus.vencido += 1
      return
    }
    const fechaExamen = parseFecha(String(raw))
    if (!fechaExamen) {
      medStatus.vencido += 1
      return
    }
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

  const cursoColumnas = {
    CB: 'curso_CB',
    TL: 'curso_TL',
    'Av. H': 'curso_AvH',
    'Av. KM': 'curso_AvKM',
    IE: 'curso_IE',
    FND: 'curso_FND',
    'IE-Ins': 'curso_IEIns',
    CR: 'curso_CR',
    CARE: 'curso_CARE',
    Tiempo: 'cursos_tiempo',
  }

  if (areaUsers.length > 0) {
    console.log('[Cursos debug] Claves del primer usuario:', Object.keys(areaUsers[0]))
    console.log('[Cursos debug] Valores de curso del primer usuario:', {
      curso_CB: areaUsers[0].curso_CB,
      curso_TL: areaUsers[0].curso_TL,
      curso_AvH: areaUsers[0].curso_AvH,
      curso_AvKM: areaUsers[0].curso_AvKM,
      curso_IE: areaUsers[0].curso_IE,
      curso_FND: areaUsers[0].curso_FND,
      curso_IEIns: areaUsers[0].curso_IEIns,
      curso_CR: areaUsers[0].curso_CR,
      curso_CARE: areaUsers[0].curso_CARE,
      cursos_tiempo: areaUsers[0].cursos_tiempo,
    })
  }

  const cursosPorTipo = {}
  Object.entries(cursoColumnas).forEach(([label, col]) => {
    const count = areaUsers.filter((u) => {
      const val = Object.prototype.hasOwnProperty.call(u, col) ? u[col] : undefined
      return !esNoCurso(val)
    }).length
    if (count > 0) cursosPorTipo[label] = count
  })

  const nivelesHbtj = {}
  areaUsers.forEach((u) => {
    const nivel = (u.nivelHBTJ && u.nivelHBTJ.toString().trim()) || 'Sin definir'
    nivelesHbtj[nivel] = (nivelesHbtj[nivel] || 0) + 1
  })

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
      const rangos = Object.values(metrics.ageDist).sort((a, b) => b.inicio - a.inicio)

      const labels = rangos.map((r) => `${r.inicio}-${r.inicio + 4}`)
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

// ── Carga de datos ──────────────────────────────────────────────────────────

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

// Alias para compatibilidad con el botón original (refreshPage)
const refreshPage = refreshData

onMounted(async () => {
  // Registrar listener ANTES de cargar datos (igual que el original)
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
/* ── Variables ── */
.ma {
  --c-bg: #f4f6fb;
  --c-surface: #ffffff;
  --c-border: #e5e9f2;
  --c-text: #1a1d2e;
  --c-text-muted: #6b7280;
  --c-accent: #4361ee;
  --c-accent-hover: #2d4fd4;
  --c-radius: 12px;
  --c-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.05);

  min-height: 100vh;
  background: var(--c-bg);
  padding: 1.5rem;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ── Header ── */
.ma__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.ma__header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.ma__header-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4361ee, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.ma__eyebrow {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--c-text-muted);
  margin: 0 0 0.15rem;
}

.ma__title {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--c-text);
  margin: 0;
  line-height: 1.2;
}

.ma__refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1.1rem;
  border-radius: 9px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  color: var(--c-text);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
  box-shadow: var(--c-shadow);
}

.ma__refresh-btn:hover:not(:disabled) {
  background: #eef2ff;
  border-color: var(--c-accent);
  color: var(--c-accent);
}

.ma__refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes spin-anim {
  to {
    transform: rotate(360deg);
  }
}
.ma__spin {
  animation: spin-anim 0.8s linear infinite;
  display: inline-block;
}

/* ── Loading ── */
.ma__loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem;
  justify-content: center;
  color: var(--c-text-muted);
  background: var(--c-surface);
  border-radius: var(--c-radius);
  border: 1px solid var(--c-border);
}

.ma__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--c-border);
  border-top-color: var(--c-accent);
  border-radius: 50%;
  animation: spin-anim 0.7s linear infinite;
  display: inline-block;
  flex-shrink: 0;
}

/* ── Alert / Error ── */
.ma__alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1.25rem;
  border-radius: var(--c-radius);
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  font-size: 0.9rem;
}

/* ── Empty state ── */
.ma__empty {
  text-align: center;
  padding: 3rem;
  color: var(--c-text-muted);
}

.ma__empty i {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.75rem;
  opacity: 0.35;
}
.ma__empty p {
  margin: 0;
  font-size: 0.9rem;
}

/* ── Org block ── */
.ma__org-block {
  margin-bottom: 2.5rem;
}

.ma__org-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--c-border);
}

.ma__org-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: #eef2ff;
  color: var(--c-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.ma__org-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--c-text);
  margin: 0;
}

.ma__org-count {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.6rem;
  border-radius: 20px;
  background: #eef2ff;
  color: var(--c-accent);
  margin-left: auto;
}

/* ── Areas list ── */
.ma__areas {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* ── Area item ── */
.ma__area-item {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--c-radius);
  overflow: hidden;
  box-shadow: var(--c-shadow);
  transition: box-shadow 0.2s;
}

.ma__area-item:has(.ma__area-trigger--open) {
  box-shadow: 0 4px 20px rgba(67, 97, 238, 0.1);
  border-color: #c7d2fe;
}

/* ── Trigger ── */
.ma__area-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--c-text);
  text-align: left;
  transition: background 0.15s;
}

.ma__area-trigger:hover {
  background: #f8fafc;
}

.ma__area-trigger--open {
  background: #f5f7ff;
  border-bottom: 1px solid var(--c-border);
}

.ma__area-trigger-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex: 1;
  overflow: hidden;
}

.ma__area-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c7d2fe;
  flex-shrink: 0;
  transition: background 0.15s;
}

.ma__area-trigger--open .ma__area-dot {
  background: var(--c-accent);
}

.ma__area-trigger-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.ma__user-count {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.6rem;
  border-radius: 20px;
  background: #eef2ff;
  color: var(--c-accent);
}

.ma__chevron {
  color: var(--c-text-muted);
  font-size: 0.75rem;
  transition: transform 0.25s;
}

.ma__chevron--open {
  transform: rotate(180deg);
}

/* ── Area body ── */
.ma__area-body {
  padding: 1.25rem 1.1rem;
}

/* ── Charts grid ── */
.ma__charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.ma__chart-card {
  background: #f8fafc;
  border: 1px solid var(--c-border);
  border-radius: 10px;
  padding: 0.85rem;
}

.ma__chart-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--c-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.ma__chart-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.ma__chart-dot--red {
  background: #dc2626;
}
.ma__chart-dot--blue {
  background: #2563eb;
}
.ma__chart-dot--purple {
  background: #7c3aed;
}
.ma__chart-dot--teal {
  background: #0f766e;
}

.ma__chart-card canvas {
  max-width: 100% !important;
  max-height: 220px !important;
}

/* ── Table section ── */
.ma__table-section {
  border-top: 1px solid var(--c-border);
  padding-top: 1.25rem;
}

.ma__table-heading {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--c-text);
  margin: 0 0 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.ma__table-heading i {
  color: var(--c-accent);
}

.ma__table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 9px;
  border: 1px solid var(--c-border);
}

.ma__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  color: var(--c-text);
}

.ma__table thead th {
  padding: 0.6rem 0.9rem;
  text-align: left;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--c-text-muted);
  background: #f8fafc;
  border-bottom: 1px solid var(--c-border);
  white-space: nowrap;
}

.ma__tr {
  border-bottom: 1px solid var(--c-border);
  transition: background 0.12s;
}

.ma__tr:last-child {
  border-bottom: none;
}
.ma__tr:hover {
  background: #f8fafc;
}

.ma__table td {
  padding: 0.6rem 0.9rem;
  vertical-align: middle;
}

.ma__td--mono {
  font-family: 'Courier New', monospace;
  font-size: 0.78rem;
  color: var(--c-text-muted);
}

.ma__td--email {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ma__link {
  color: var(--c-accent);
  text-decoration: none;
  font-size: 0.82rem;
}

.ma__link:hover {
  text-decoration: underline;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .ma {
    padding: 1rem;
  }
  .ma__title {
    font-size: 1.3rem;
  }

  .ma__charts {
    grid-template-columns: 1fr;
  }

  .ma__th--hide-sm {
    display: none;
  }
}

@media (max-width: 480px) {
  .ma {
    padding: 0.75rem;
  }
  .ma__refresh-btn span {
    display: none;
  }
  .ma__refresh-btn {
    padding: 0.5rem 0.65rem;
  }
}
</style>
