<template>
  <!-- Offcanvas lateral/bottom para formulario -->
  <div
    class="offcanvas offcanvas-end"
    :class="{ show: isOpen }"
    tabindex="-1"
    :id="offcanvasId"
    aria-labelledby="profileFormLabel"
  >
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="profileFormLabel">
        {{ isEditing ? '✏️ Editar Perfil' : '👤 Mi Perfil' }}
      </h5>
      <button type="button" class="btn-close" @click="close" aria-label="Close"></button>
    </div>

    <div class="offcanvas-body">
      <form @submit.prevent="handleSubmit">
        <!-- Mensajes -->
        <div v-if="successMessage" class="alert alert-success alert-dismissible fade show">
          {{ successMessage }}
          <button type="button" class="btn-close" @click="successMessage = ''"></button>
        </div>
        <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show">
          {{ errorMessage }}
          <button type="button" class="btn-close" @click="errorMessage = ''"></button>
        </div>

        <!-- Campos de formulario (genéricos) -->
        <!-- Acordeones por temática -->
        <div class="accordion mb-4" id="formAccordion">
          <!-- Información Personal -->
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#formPersonal"
              >
                <i class="bi bi-person me-2"></i> Información Personal
              </button>
            </h2>
            <div
              id="formPersonal"
              class="accordion-collapse collapse show"
              data-bs-parent="#formAccordion"
            >
              <div class="accordion-body">
                <div class="mb-3">
                  <label for="dni" class="form-label">DNI</label>
                  <input
                    v-model.number="formData.DNI"
                    type="number"
                    class="form-control"
                    id="dni"
                    :disabled="true"
                    readonly
                  />
                  <small class="text-muted">No se puede cambiar</small>
                </div>

                <div class="mb-3">
                  <label for="nombre" class="form-label">Nombre</label>
                  <input
                    v-model="formData.nombre"
                    type="text"
                    class="form-control"
                    id="nombre"
                    placeholder="Ingrese nombre"
                    :disabled="isLoading"
                  />
                </div>

                <div class="mb-3">
                  <label for="apellido" class="form-label">Apellido</label>
                  <input
                    v-model="formData.apellido"
                    type="text"
                    class="form-control"
                    id="apellido"
                    placeholder="Ingrese apellido"
                    :disabled="isLoading"
                  />
                </div>

                <div class="mb-3">
                  <label for="nacimiento" class="form-label">Nacimiento</label>
                  <input
                    v-model="formData.nacimiento"
                    type="date"
                    class="form-control"
                    id="nacimiento"
                    :disabled="isLoading"
                  />
                </div>

                <div class="mb-3">
                  <label for="genero" class="form-label">Género</label>
                  <select
                    v-model="formData.genero"
                    class="form-select"
                    id="genero"
                    :disabled="isLoading"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label for="cuil" class="form-label">CUIL</label>
                  <input
                    v-model="formData.CUIL"
                    type="text"
                    class="form-control"
                    id="cuil"
                    placeholder="Ej: 20-12345678-9"
                    :disabled="isLoading"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Contacto -->
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#formContacto"
              >
                <i class="bi bi-telephone me-2"></i> Contacto
              </button>
            </h2>
            <div
              id="formContacto"
              class="accordion-collapse collapse"
              data-bs-parent="#formAccordion"
            >
              <div class="accordion-body">
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    v-model="formData.email"
                    type="email"
                    class="form-control"
                    id="email"
                    placeholder="Ingrese email"
                    :disabled="isLoading"
                  />
                </div>

                <div class="mb-3">
                  <label for="cellphone" class="form-label">Teléfono</label>
                  <input
                    v-model="formData.cellphone"
                    type="text"
                    class="form-control"
                    id="cellphone"
                    placeholder="Ingrese teléfono"
                    :disabled="isLoading"
                  />
                </div>

                <div class="mb-3">
                  <label for="mail_operativo" class="form-label">Email Operativo</label>
                  <input
                    v-model="formData.mail_operativo"
                    type="email"
                    class="form-control"
                    id="mail_operativo"
                    placeholder="Ingrese email operativo"
                    :disabled="isLoading"
                  />
                </div>

                <div class="mb-3">
                  <label for="mail_personal" class="form-label">Email Personal</label>
                  <input
                    v-model="formData.mail_personal"
                    type="email"
                    class="form-control"
                    id="mail_personal"
                    placeholder="Ingrese email personal"
                    :disabled="isLoading"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Domicilio -->
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#formDomicilio"
              >
                <i class="bi bi-houses me-2"></i> Domicilio
              </button>
            </h2>
            <div
              id="formDomicilio"
              class="accordion-collapse collapse"
              data-bs-parent="#formAccordion"
            >
              <div class="accordion-body">
                <div class="mb-3">
                  <label for="direccion" class="form-label">Dirección 1</label>
                  <input
                    v-model="formData.direccion1"
                    type="text"
                    class="form-control"
                    id="direccion"
                    placeholder="Ingrese dirección"
                    :disabled="isLoading"
                  />
                </div>
                <div class="mb-3">
                  <label for="barrio" class="form-label">Barrio 1</label>
                  <input
                    v-model="formData.barrio1"
                    type="text"
                    class="form-control"
                    id="barrio"
                    placeholder="Ingrese barrio"
                    :disabled="isLoading"
                  />
                </div>

                <div class="mb-3">
                  <label for="direccion2" class="form-label">Dirección 2</label>
                  <input
                    v-model="formData.direccion2"
                    type="text"
                    class="form-control"
                    id="direccion"
                    placeholder="Ingrese dirección"
                    :disabled="isLoading"
                  />
                </div>
                <div class="mb-3">
                  <label for="barrio2" class="form-label">Barrio 2</label>
                  <input
                    v-model="formData.barrio2"
                    type="text"
                    class="form-control"
                    id="barrio2"
                    placeholder="Ingrese barrio"
                    :disabled="isLoading"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Médicos -->
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#formMedicos"
              >
                <i class="bi bi-heart-pulse me-2"></i> Médicos
              </button>
            </h2>
            <div
              id="formMedicos"
              class="accordion-collapse collapse"
              data-bs-parent="#formAccordion"
            >
              <div class="accordion-body">
                <div class="mb-3">
                  <label for="medico_cabecera" class="form-label">Médico de Cabecera</label>
                  <input
                    v-model="formData.medico_cabecera"
                    type="text"
                    class="form-control"
                    id="medico_cabecera"
                    placeholder="Nombre del médico"
                    :disabled="isLoading"
                  />
                </div>

                <div class="mb-3">
                  <label for="especialidad_medico" class="form-label">Especialidad</label>
                  <input
                    v-model="formData.especialidad_medico"
                    type="text"
                    class="form-control"
                    id="especialidad_medico"
                    placeholder="Ej: Cardiólogo, Dermatólogo, etc"
                    :disabled="isLoading"
                  />
                </div>

                <div class="mb-3">
                  <label for="telefono_medico" class="form-label">Teléfono</label>
                  <input
                    v-model="formData.telefono_medico"
                    type="text"
                    class="form-control"
                    id="telefono_medico"
                    placeholder="Ingrese teléfono"
                    :disabled="isLoading"
                  />
                </div>

                <div class="mb-3">
                  <label for="obra_social" class="form-label">Obra Social</label>
                  <input
                    v-model="formData.obra_social"
                    type="text"
                    class="form-control"
                    id="obra_social"
                    placeholder="Ej: OSDE, Medicus, etc"
                    :disabled="isLoading"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Organización -->
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#formOrganizacion"
              >
                <i class="bi bi-building me-2"></i> Organización
              </button>
            </h2>
            <div
              id="formOrganizacion"
              class="accordion-collapse collapse"
              data-bs-parent="#formAccordion"
            >
              <div class="accordion-body">
                <div v-if="showOrgField" class="mb-3">
                  <label for="organizacion" class="form-label">Organización</label>
                  <select
                    v-model="formData.organizacion"
                    type="text"
                    class="form-select"
                    id="organizacion"
                    placeholder="Ingrese organización"
                    :disabled="isLoading"
                  >
                    <option value="DAC">DAC</option>
                    <option value="FJ">FJ</option>
                    <option value="BH">BH</option>
                    <option value="LH">LH</option>
                    <option value="IONA">IONA</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label for="areas" class="form-label">Áreas</label>
                  <select
                    v-model="formData.areas"
                    type="text"
                    class="form-select"
                    id="areas"
                    multiple="multiple"
                    :disabled="isLoading"
                  >
                    <option value="HBTJ">HBTJ</option>
                    <option value="ENSH">ENSH</option>
                    <option value="CARE">CARE</option>
                    <option value="IT">IT</option>
                    <option value="IE">IE</option>
                    <option value="MILU">MILU</option>
                    <option value="HDRJ - MDRJ/RSH">HDRJ - MDRJ/RSH</option>
                    <option value="HDRJ - JNJ RGL K1">HDRJ - JNJ RGL K1</option>
                    <option value="HDRJ - JNJ RGL K2B">HDRJ - JNJ RGL K2B</option>
                    <option value="HDRJ - JNJ RGL K2A">HDRJ - JNJ RGL K2A</option>
                    <option value="HDRJ - JNJ DDM K1">HDRJ - JNJ DDM K1</option>
                    <option value="HDRJ - JNJ DDM K2">HDRJ - JNJ DDM K2</option>
                    <option value="FND">FND</option>
                    <option value="FND - JNJ">FND - JNJ</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label for="apodo" class="form-label">Apodo</label>
                  <input
                    v-model="formData.apodo"
                    type="text"
                    class="form-control"
                    id="apodo"
                    placeholder="Ingrese apodo"
                    :disabled="isLoading"
                  />
                </div>

                <div class="mb-3">
                  <label for="fecha_ingresoOrg" class="form-label">Fecha de Ingreso</label>
                  <input
                    v-model="formData.fecha_ingresoOrg"
                    type="date"
                    class="form-control"
                    id="fecha_ingresoOrg"
                    :disabled="isLoading"
                  />
                </div>
                <div class="mb-3">
                  <label for="nivelHBTJ" class="form-label">Nivel de HBTJ</label>
                  <select
                    v-model="formData.nivelHBTJ"
                    class="form-select"
                    id="nivelHBTJ"
                    :disabled="isLoading"
                  >
                    <option value=""></option>
                    <option value="B">B</option>
                    <option value="A">A</option>
                    <option value="MFKD0">MFKD0</option>
                    <option value="MFKD1">MFKD1</option>
                    <option value="MFKD2">MFKD2</option>
                    <option value="MFKD3">MFKD3</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="activo" class="form-label me-2">¿Activo?</label>
                  <input
                    v-model="formData.activo"
                    type="checkbox"
                    class="form-check-input ml-2"
                    id="activo"
                    :disabled="isLoading"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Vida y Desarrollo -->
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#formDesarrollo"
              >
                <i class="bi bi-book me-2"></i> Vida y Desarrollo
              </button>
            </h2>
            <div
              id="formDesarrollo"
              class="accordion-collapse collapse"
              data-bs-parent="#formAccordion"
            >
              <div class="accordion-body">
                <div class="mb-3">
                  <label for="educacion" class="form-label">Educación</label>
                  <input
                    v-model="formData.educacion"
                    type="text"
                    class="form-control"
                    id="educacion"
                    placeholder="Ej: Licenciado en..., Técnico en..."
                    :disabled="isLoading"
                  />
                </div>

                <div class="mb-3">
                  <label for="profesion" class="form-label">Profesión</label>
                  <input
                    v-model="formData.profesion"
                    type="text"
                    class="form-control"
                    id="profesion"
                    placeholder="Ingrese profesión"
                    :disabled="isLoading"
                  />
                </div>

                <div class="mb-3">
                  <label for="experiencia" class="form-label">Experiencia</label>
                  <input
                    v-model="formData.experiencia"
                    type="text"
                    class="form-control"
                    id="experiencia"
                    placeholder="Años y áreas de experiencia"
                    :disabled="isLoading"
                  />
                </div>

                <div class="mb-3">
                  <label for="habilidades" class="form-label">Habilidades</label>
                  <input
                    v-model="formData.habilidades"
                    type="text"
                    class="form-control"
                    id="habilidades"
                    placeholder="Ingrese habilidades (separadas por comas)"
                    :disabled="isLoading"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Técnicos -->
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#formTecnicos"
              >
                <i class="bi bi-gear me-2"></i> Técnicos
              </button>
            </h2>
            <div
              id="formTecnicos"
              class="accordion-collapse collapse"
              data-bs-parent="#formAccordion"
            >
              <div class="accordion-body">
                <div class="mb-3">
                  <label for="telegram" class="form-label">Telegram ID</label>
                  <input
                    v-model="formData['Telegram ID']"
                    type="text"
                    class="form-control"
                    id="telegram"
                    placeholder="Ingrese Telegram ID"
                    :disabled="isLoading"
                  />
                </div>

                <div class="mb-3">
                  <label for="id_jvr" class="form-label">ID Javerim</label>
                  <input
                    v-model="formData.ID_JVR"
                    type="text"
                    class="form-control"
                    id="id_jvr"
                    placeholder="Ingrese ID Javerim"
                    :disabled="isLoading"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones -->
        <div class="d-grid gap-2 mt-4">
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            <span v-if="!isLoading"><i class="bi bi-check-circle me-2"></i>Actualizar Datos</span>
            <span v-else>
              <span class="spinner-border spinner-border-sm me-2"></span>Guardando...
            </span>
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="close"
            :disabled="isLoading"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Backdrop -->
  <div v-if="isOpen" class="offcanvas-backdrop fade show" @click="close"></div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { update } from '@/services/api'

// Props
const props = defineProps({
  profileData: {
    type: Object,
    default: () => ({}),
  },
  showOrgField: {
    type: Boolean,
    default: false,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['update', 'close'])

// Estado
const isOpen = ref(false)
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const offcanvasId = computed(() => `profileForm-${Math.random().toString(36).substr(2, 9)}`)

// Formulario
const formData = ref({
  // Datos personales
  DNI: null,
  dni: null,
  nombre: '',
  apellido: '',
  email: '',
  cellphone: null,
  nacimiento: '',
  genero: '',
  CUIL: '',
  // Contacto
  mail_operativo: '',
  mail_personal: '',
  // Domicilio
  direccion1: '',
  barrio1: '',
  direccion2: '',
  barrio2: '',
  // Médicos
  foto_dni: '',
  foto_rostro: '',
  obraSocial: '',
  obraSocial_Plan: '',
  obraSocial_id: '',
  med_dieta: '',
  med_sangre: '',
  med_historia: '',
  med_problemas: '',
  med_act: '',
  med_actLesion: '',
  // Organización
  organizacion: '',
  areas: '',
  apodo: '',
  fecha_ingresoOrg: '',
  nivelHBTJ: '',
  activo: '',
  fecha_ingresoMilu: '',
  areas_historicas: '',
  CBok: '',
  curso_TL: '',
  curso_FND: '',
  curso_AvH: '',
  curso_AvKM: '',
  curso_IE: '',
  // Vida y Desarrollo
  // Técnicos
  ID_JVR: '',
  TelegramID: '',
})

// Watchers
watch(
  () => props.profileData,
  (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      formData.value = {
        DNI: newData.DNI || newData.dni,
        dni: newData.dni || newData.DNI,
        CUIL: newData.CUIL || '',
        nombre: newData.nombre || '',
        apellido: newData.apellido || '',
        email: newData.email || newData.mail_operativo || newData.mail_personal || '',
        cellphone: newData.cellphone || newData.celular || '',
        nacimiento: newData.nacimiento || '',
        genero: newData.genero || '',
        mail_operativo: newData.mail_operativo || '',
        mail_personal: newData.mail_personal || '',
        direccion1: newData.direccion1 || '',
        barrio1: newData.barrio1 || '',
        direccion2: newData.direccion2 || '',
        barrio2: newData.barrio2 || '',
        foto_dni: newData.foto_dni || '',
        foto_rostro: newData.foto_rostro || '',
        obraSocial: newData.obraSocial || '',
        obraSocial_Plan: newData.obraSocial_Plan || '',
        obraSocial_id: newData.obraSocial_id || '',
        med_dieta: newData.med_dieta || '',
        med_sangre: newData.med_sangre || '',
        med_historia: newData.med_historia || '',
        med_problemas: newData.med_problemas || '',
        med_act: newData.med_act || '',
        med_actLesion: newData.med_actLesion || '',
        organizacion: newData.organizacion || '',
        areas: newData.areas || '',
        apodo: newData.apodo || '',
        fecha_ingresoOrg: newData.fecha_ingresoOrg || '',
        nivelHBTJ: newData.nivelHBTJ || '',
        activo: newData.activo || '',
        fecha_ingresoMilu: newData.fecha_ingresoMilu || '',
        areas_historicas: newData.areas_historicas || '',
        CBok: newData.CBok || '',
        curso_TL: newData.curso_TL || '',
        curso_FND: newData.curso_FND || '',
        curso_AvH: newData.curso_AvH || '',
        curso_AvKM: newData.curso_AvKM || '',
        curso_IE: newData.curso_IE || '',
        ID_JVR: newData.ID_JVR || newData.id_jvr || '',
        TelegramID: newData.TelegramID || newData.telegram_id || '',
      }
    }
  },
  { deep: true, immediate: true },
)

// Métodos
const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
  successMessage.value = ''
  errorMessage.value = ''
}

const handleSubmit = async () => {
  try {
    errorMessage.value = ''
    successMessage.value = ''

    if (!formData.value.nombre || !formData.value.apellido) {
      errorMessage.value = 'Por favor completa nombre y apellido'
      return
    }

    isLoading.value = true

    // Actualizar en main con TODOS los campos
    const mainData = {
      DNI: formData.value.DNI,
      nombre: formData.value.nombre,
      apellido: formData.value.apellido,
      celular: formData.value.cellphone,
      nacimiento: formData.value.nacimiento,
      genero: formData.value.genero,
      mail_operativo: formData.value.mail_operativo,
      mail_personal: formData.value.mail_personal,
      CUIL: formData.value.CUIL,
      direccion1: formData.value.direccion1,
      barrio1: formData.value.barrio1,
      direccion2: formData.value.direccion2,
      barrio2: formData.value.barrio2,
      foto_dni: formData.value.foto_dni,
      foto_rostro: formData.value.foto_rostro,
      obraSocial: formData.value.obraSocial,
      obraSocial_Plan: formData.value.obraSocial_Plan,
      obraSocial_id: formData.value.obraSocial_id,
      med_dieta: formData.value.med_dieta,
      med_sangre: formData.value.med_sangre,
      med_historia: formData.value.med_historia,
      med_problemas: formData.value.med_problemas,
      med_act: formData.value.med_act,
      med_actLesion: formData.value.med_actLesion,
      organizacion: formData.value.organizacion,
      areas: formData.value.areas,
      apodo: formData.value.apodo,
      fecha_ingresoOrg: formData.value.fecha_ingresoOrg,
      nivelHBTJ: formData.value.nivelHBTJ,
      activo: formData.value.activo,
      fecha_ingresoMilu: formData.value.fecha_ingresoMilu,
      areas_historicas: formData.value.areas_historicas,
      CBok: formData.value.CBok,
      curso_TL: formData.value.curso_TL,
      curso_FND: formData.value.curso_FND,
      curso_AvH: formData.value.curso_AvH,
      curso_AvKM: formData.value.curso_AvKM,
      curso_IE: formData.value.curso_IE,
      TelegramID: formData.value.TelegramID,
      ID_JVR: formData.value.ID_JVR,
    }

    await update('main', mainData)

    // Actualizar en users (campos limitados)
    try {
      await update('users', {
        dni: formData.value.dni,
        email: formData.value.email,
        cellphone: formData.value.cellphone,
      })
    } catch (err) {
      console.log('No se actualizó en users (puede no existir)')
    }

    successMessage.value = '✅ Datos actualizados correctamente'
    emit('update', formData.value)

    setTimeout(() => {
      close()
    }, 1500)
  } catch (error) {
    errorMessage.value = error.message || 'Error al actualizar datos'
    console.error('Error:', error)
  } finally {
    isLoading.value = false
  }
}

// Exponer métodos
defineExpose({
  open,
  close,
})
</script>

<style scoped>
.offcanvas {
  background-color: #f8f9fa;
}

.offcanvas.show {
  transform: translateX(0);
  visibility: visible;
}

.offcanvas-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1040;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
}

.offcanvas-header {
  border-bottom: 1px solid #dee2e6;
}

.offcanvas-title {
  font-weight: 600;
  color: #0d6efd;
}

@media (max-width: 768px) {
  .offcanvas-end {
    width: 100% !important;
  }
}

@media (min-width: 769px) {
  .offcanvas-end {
    width: 400px !important;
  }
}
</style>
