<template>
  <div class="container-fluid py-4">
    <div class="row">
      <div class="col-12">
        <h1 class="mb-4"><i class="bi bi-diagram-3"></i> Mis Áreas</h1>

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
                            <h6 class="card-title mb-0">Resumen General</h6>
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
const chartInstances = ref({}) // Almacenar referencias de Charts

// Función para determinar qué áreas puede ver el usuario
const getAllowedAreas = () => {
  const user = authStore.user
  console.log('Current user:', user)
  if (!user) return []

  if (user.it_level === 3) {
    // Nivel 3: todas las áreas de todas las organizaciones
    const allowed = users.value.filter((u) => u.activo === 1)
    console.log('Nivel 3 - allowed users:', allowed.length)
    return allowed
  } else if (user.it_level === 2) {
    if (user.areas_ref && user.areas_ref.includes('ROSH')) {
      // Nivel 2 con ROSH: todas las áreas de su organización
      const allowed = users.value.filter(
        (u) => u.activo === 1 && u.organizacion === user.organizacion,
      )
      console.log('Nivel 2 con ROSH - allowed users:', allowed.length, 'org:', user.organizacion)
      return allowed
    } else {
      // Nivel 2 normal: solo sus áreas de su organización
      const userAreas = user.areas_ref ? user.areas_ref.split(',').map((a) => a.trim()) : []
      console.log('Nivel 2 normal - user areas:', userAreas, 'user org:', user.organizacion)
      const allowed = users.value.filter((u) => {
        if (u.activo !== 1 || u.organizacion !== user.organizacion) return false
        const userAreasRef = u.areas_ref ? u.areas_ref.split(',').map((a) => a.trim()) : []
        const hasCommonArea = userAreas.some((area) => userAreasRef.includes(area))
        if (hasCommonArea) {
          console.log('Including user:', u.nombre, u.apellido, 'areas:', userAreasRef)
        }
        return hasCommonArea
      })
      console.log('Nivel 2 normal - allowed users:', allowed.length)
      return allowed
    }
  }
  console.log('Nivel no autorizado:', user.it_level)
  return []
}

// Agrupar usuarios por organización y luego por área
const groupedUsers = computed(() => {
  const allowedUsers = getAllowedAreas()
  const groups = {}

  // determinar filtro de áreas del usuario actual
  let areaFilter = null
  const me = authStore.user
  if (me && me.it_level === 2 && !(me.areas_ref && me.areas_ref.includes('ROSH'))) {
    areaFilter = me.areas_ref ? me.areas_ref.split(',').map((a) => a.trim()) : []
  }

  allowedUsers.forEach((user) => {
    const org = user.organizacion || 'Sin Organización'
    if (!groups[org]) {
      groups[org] = { areas: {} }
    }

    const areasRef = user.areas_ref ? user.areas_ref.split(',').map((a) => a.trim()) : []
    areasRef.forEach((area) => {
      // si hay filtro y el área no está en él, no crear acordeón para ese área
      if (areaFilter && !areaFilter.includes(area)) return

      if (!groups[org].areas[area]) {
        groups[org].areas[area] = {
          area,
          users: [],
        }
      }
      groups[org].areas[area].users.push(user)
    })
  })

  return groups
})

// Calcular métricas para un área
const calculateMetrics = (areaUsers) => {
  const totalUsers = areaUsers.length

  // clasificar estudios médicos según fecha de vencimiento
  const now = new Date()
  const msInDay = 1000 * 60 * 60 * 24
  const medStatus = { ok: 0, porVencer: 0, vencido: 0 }

  // distribución de edades por género
  const ageDist = {}

  areaUsers.forEach((u) => {
    // estudios médicos
    const fechaStr = u.med_estudios_fecha
    if (!fechaStr) {
      medStatus.vencido += 1
    } else {
      const expiry = new Date(fechaStr)
      const diff = expiry - now
      if (diff < 0) {
        medStatus.vencido += 1
      } else if (diff <= 30 * msInDay) {
        medStatus.porVencer += 1
      } else {
        medStatus.ok += 1
      }
    }

    // edad
    if (u.nacimiento) {
      const birth = new Date(u.nacimiento)
      let age = now.getFullYear() - birth.getFullYear()
      const m = now.getMonth() - birth.getMonth()
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age -= 1
      }
      const sex = u.genero === 'Masculino' ? 'M' : u.genero === 'Femenino' ? 'F' : 'Otro'
      if (!ageDist[age]) ageDist[age] = {}
      ageDist[age][sex] = (ageDist[age][sex] || 0) + 1
    }
  })

  const cursosPorTipo = areaUsers.reduce((acc, u) => {
    if (u.CBok) acc['CB'] = (acc['CB'] || 0) + 1
    if (u.curso_TL) acc['TL'] = (acc['TL'] || 0) + 1
    if (u.curso_AvH) acc['Av. H'] = (acc['Av. H'] || 0) + 1
    if (u.curso_AvKM) acc['Av. KM'] = (acc['Av. KM'] || 0) + 1
    if (u.curso_IE) acc['IE'] = (acc['IE'] || 0) + 1
    if (u.curso_FND) acc['FND'] = (acc['FND'] || 0) + 1
    return acc
  }, {})

  const nivelesHbtj = areaUsers.reduce((acc, u) => {
    const nivel = u.nivelHBTJ || 'Sin definir'
    acc[nivel] = (acc[nivel] || 0) + 1
    return acc
  }, {})

  const metrics = {
    totalUsers,
    medStatus,
    cursosPorTipo,
    nivelesHbtj,
    ageDist,
  }
  console.log('Metrics for area:', metrics)
  return metrics
}

// Crear gráficos
const createCharts = async () => {
  await nextTick()

  Object.keys(groupedUsers.value).forEach((orgKey) => {
    const orgData = groupedUsers.value[orgKey]
    const sanitizedOrgKey = orgKey.replace(/\s+/g, '_')
    Object.keys(orgData.areas).forEach((areaKey) => {
      const areaData = orgData.areas[areaKey]
      const sanitizedAreaKey = areaKey.replace(/\s+/g, '_')
      const metrics = calculateMetrics(areaData.users)

      // Gráfico de estudios médicos (pie color-coded)
      const chartId = `chartMedicos${sanitizedOrgKey}-${sanitizedAreaKey}`
      const ctxMedicos = document.getElementById(chartId)
      console.log(
        'Creating medicos chart:',
        chartId,
        'ctx:',
        !!ctxMedicos,
        'metrics:',
        metrics.medStatus,
      )
      if (ctxMedicos) {
        // Destruir chart anterior si existe
        if (chartInstances.value[chartId]) {
          chartInstances.value[chartId].destroy()
        }
        const { ok, porVencer, vencido } = metrics.medStatus
        chartInstances.value[chartId] = new ChartJS(ctxMedicos, {
          type: 'pie',
          data: {
            labels: ['Ok', 'Por vencer', 'Vencido'],
            datasets: [
              {
                data: [ok, porVencer, vencido],
                backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Estudios Médicos Certificado',
              },
            },
          },
        })
        console.log('Medicos chart created successfully')
      } else {
        console.log('Medicos canvas not found:', chartId)
      }

      // Gráfico de cursos: pie por tipo
      const chartIdCursos = `chartCursos${sanitizedOrgKey}-${sanitizedAreaKey}`
      const ctxCursos = document.getElementById(chartIdCursos)
      console.log(
        'Creating cursos chart:',
        chartIdCursos,
        'ctx:',
        !!ctxCursos,
        'cursosPorTipo:',
        metrics.cursosPorTipo,
      )
      if (ctxCursos) {
        if (chartInstances.value[chartIdCursos]) {
          chartInstances.value[chartIdCursos].destroy()
        }
        chartInstances.value[chartIdCursos] = new ChartJS(ctxCursos, {
          type: 'pie',
          data: {
            labels: Object.keys(metrics.cursosPorTipo),
            datasets: [
              {
                data: Object.values(metrics.cursosPorTipo),
                backgroundColor: ['#007bff', '#6610f2', '#6f42c1', '#e83e8c', '#fd7e14', '#20c997'],
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              title: { display: true, text: 'Cursos por Tipo' },
              legend: {
                display: true,
                position: 'bottom',
              },
            },
          },
        })
        console.log('Cursos chart created successfully')
      } else {
        console.log('Cursos canvas not found:', chartIdCursos)
      }

      // Gráfico de niveles HBTJ
      const chartIdNiveles = `chartNiveles${sanitizedOrgKey}-${sanitizedAreaKey}`
      const ctxNiveles = document.getElementById(chartIdNiveles)
      console.log(
        'Creating niveles chart:',
        chartIdNiveles,
        'ctx:',
        !!ctxNiveles,
        'nivelesHbtj:',
        metrics.nivelesHbtj,
      )
      if (ctxNiveles) {
        // Destruir chart anterior si existe
        if (chartInstances.value[chartIdNiveles]) {
          chartInstances.value[chartIdNiveles].destroy()
        }
        const nivelesLabels = Object.keys(metrics.nivelesHbtj)
        const nivelesData = Object.values(metrics.nivelesHbtj)
        chartInstances.value[chartIdNiveles] = new ChartJS(ctxNiveles, {
          type: 'pie',
          data: {
            labels: nivelesLabels,
            datasets: [
              {
                data: nivelesData,
                backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#ff9f40'],
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Niveles HBTJ',
              },
            },
          },
        })
        console.log('Niveles chart created successfully')
      } else {
        console.log('Niveles canvas not found:', chartIdNiveles)
      }

      // Gráfico general: pirámide poblacional de edades por género
      const chartIdGeneral = `chartGeneral${sanitizedOrgKey}-${sanitizedAreaKey}`
      const ctxGeneral = document.getElementById(chartIdGeneral)
      console.log(
        'Creating general chart:',
        chartIdGeneral,
        'ctx:',
        !!ctxGeneral,
        'ageDist:',
        metrics.ageDist,
      )
      console.log('ageDist data:', metrics.ageDist)
      if (ctxGeneral) {
        if (chartInstances.value[chartIdGeneral]) {
          chartInstances.value[chartIdGeneral].destroy()
        }
        const ages = Object.keys(metrics.ageDist)
          .map((a) => parseInt(a))
          .sort((a, b) => a - b)

        if (ages.length === 0) {
          // No hay datos de edad, mostrar gráfico vacío
          chartInstances.value[chartIdGeneral] = new ChartJS(ctxGeneral, {
            type: 'bar',
            indexAxis: 'y',
            data: {
              labels: ['Sin datos'],
              datasets: [
                {
                  label: 'Male',
                  data: [0],
                  backgroundColor: '#007bff',
                },
                {
                  label: 'Female',
                  data: [0],
                  backgroundColor: '#e83e8c',
                },
              ],
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              plugins: {
                title: { display: true, text: 'Pirámide Poblacional - Sin datos de edad' },
              },
            },
          })
        } else {
          // agrupar edades en rangos de 10 en 10
          const ageRanges = []
          const ageRangeLabels = []
          const minAge = Math.min(...ages)
          const maxAge = Math.max(...ages)

          for (let i = minAge; i <= maxAge; i += 10) {
            const rangeLabel = `${i}-${Math.min(i + 9, maxAge)}`
            ageRangeLabels.push(rangeLabel)
            let maleCount = 0
            let femaleCount = 0
            for (let j = i; j < i + 10 && j <= maxAge; j++) {
              if (metrics.ageDist[j]) {
                maleCount += metrics.ageDist[j]['M'] || 0
                femaleCount += metrics.ageDist[j]['F'] || 0
              }
            }
            ageRanges.push({ male: -maleCount, female: femaleCount })
          }

          console.log('ageRanges:', ageRanges)
          console.log('ageRangeLabels:', ageRangeLabels)

          chartInstances.value[chartIdGeneral] = new ChartJS(ctxGeneral, {
            type: 'bar',
            indexAxis: 'y', // horizontal bars
            data: {
              labels: ageRangeLabels,
              datasets: [
                {
                  label: 'Hombres',
                  data: ageRanges.map((r) => r.male),
                  backgroundColor: '#007bff',
                },
                {
                  label: 'Mujeres',
                  data: ageRanges.map((r) => r.female),
                  backgroundColor: '#e83e8c',
                },
              ],
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              scales: {
                x: {
                  stacked: false,
                  ticks: {
                    callback: function (value) {
                      return Math.abs(value)
                    },
                  },
                },
              },
              plugins: {
                title: { display: true, text: 'Pirámide Poblacional' },
                legend: {
                  display: true,
                  position: 'bottom',
                },
              },
            },
          })
        }
      }
    })
  })
}

// Cargar datos
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

onMounted(() => {
  loadData()

  // volver a dibujar cuando un acordeón se abre
  document.addEventListener('shown.bs.collapse', () => {
    // pequeño retraso para que el DOM tenga ancho final
    setTimeout(() => {
      createCharts()
    }, 100)
  })
})

// Watch para recrear gráficos cuando cambian los datos agrupados
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
