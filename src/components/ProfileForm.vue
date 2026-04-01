<template>
  <!-- Offcanvas lateral -->
  <div class="pf-backdrop" v-if="isOpen" @click="close"></div>

  <div class="pf" :class="{ 'pf--open': isOpen }">
    <!-- Header del offcanvas -->
    <div class="pf__header">
      <div class="pf__header-left">
        <span class="pf__header-icon"><i class="bi bi-pencil-square"></i></span>
        <h2 class="pf__header-title">{{ isEditing ? 'Editar Perfil' : 'Mi Perfil' }}</h2>
      </div>
      <button class="pf__close" @click="close" aria-label="Cerrar">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <!-- Body -->
    <div class="pf__body">
      <form @submit.prevent="handleSubmit">
        <!-- Acordeones del formulario -->
        <div class="pf__accordion">
          <!-- 1. Información Personal -->
          <div class="pf__acc-item">
            <button
              type="button"
              class="pf__acc-trigger"
              @click="toggleSection('personal')"
              :class="{ open: openSections.personal }"
            >
              <span class="pf__acc-left">
                <span class="pf__acc-icon pf__acc-icon--blue"><i class="bi bi-person"></i></span>
                Información Personal
                <span v-if="!canEditSection('personal')" class="pf__readonly-tag"
                  >Solo lectura</span
                >
              </span>
              <i
                class="bi bi-chevron-down pf__chevron"
                :class="{ rotated: openSections.personal }"
              ></i>
            </button>
            <div class="pf__acc-body" v-show="openSections.personal">
              <div class="pf__field">
                <label class="pf__label" for="dni">DNI</label>
                <input
                  v-model.number="formData.DNI"
                  type="number"
                  class="pf__input pf__input--disabled"
                  id="dni"
                  :disabled="true"
                  readonly
                />
                <small class="pf__hint">No se puede cambiar</small>
              </div>
              <div class="pf__field">
                <label class="pf__label" for="cuil">CUIL</label>
                <input
                  v-model="formData.CUIL"
                  type="text"
                  class="pf__input"
                  id="cuil"
                  placeholder="Ej: 20-12345678-9"
                  :disabled="isLoading || !canEditSection('personal')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('personal') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="nombre">Nombre</label>
                <input
                  v-model="formData.nombre"
                  type="text"
                  class="pf__input"
                  id="nombre"
                  placeholder="Ingrese nombre"
                  required
                  :disabled="isLoading || !canEditSection('personal')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('personal') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="apellido">Apellido</label>
                <input
                  v-model="formData.apellido"
                  type="text"
                  class="pf__input"
                  id="apellido"
                  placeholder="Ingrese apellido"
                  required
                  :disabled="isLoading || !canEditSection('personal')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('personal') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="nacimiento">Nacimiento</label>
                <input
                  v-model="formData.nacimiento"
                  type="date"
                  class="pf__input"
                  id="nacimiento"
                  :disabled="isLoading || !canEditSection('personal')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('personal') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="genero">Género</label>
                <select
                  v-model="formData.genero"
                  class="pf__input pf__select"
                  id="genero"
                  :disabled="isLoading || !canEditSection('personal')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('personal') }"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 2. Contacto -->
          <div class="pf__acc-item">
            <button
              type="button"
              class="pf__acc-trigger"
              @click="toggleSection('contacto')"
              :class="{ open: openSections.contacto }"
            >
              <span class="pf__acc-left">
                <span class="pf__acc-icon pf__acc-icon--green"
                  ><i class="bi bi-telephone"></i
                ></span>
                Contacto
                <span v-if="!canEditSection('contacto')" class="pf__readonly-tag"
                  >Solo lectura</span
                >
              </span>
              <i
                class="bi bi-chevron-down pf__chevron"
                :class="{ rotated: openSections.contacto }"
              ></i>
            </button>
            <div class="pf__acc-body" v-show="openSections.contacto">
              <div class="pf__field">
                <label class="pf__label" for="celular">Celular</label>
                <div class="pf__input-group">
                  <select
                    v-model="formData.celular_countryCode"
                    class="pf__input pf__select pf__input-group-select"
                    :disabled="isLoading || !canEditSection('contacto')"
                    :class="{ 'pf__input--disabled': isLoading || !canEditSection('contacto') }"
                  >
                    <option
                      v-for="country in COUNTRIES_CODES"
                      :key="country.code"
                      :value="country.code"
                    >
                      +{{ country.dial_code }} {{ country.emoji }}
                    </option>
                  </select>
                  <input
                    v-model="formData.celular"
                    type="tel"
                    class="pf__input pf__input-group-main"
                    id="celular"
                    placeholder="1155554444"
                    :disabled="isLoading || !canEditSection('contacto')"
                    :class="{ 'pf__input--disabled': isLoading || !canEditSection('contacto') }"
                  />
                </div>
                <small class="pf__hint"
                  >Seleccioná el país y luego ingresá el número sin código de país</small
                >
              </div>
              <div class="pf__field">
                <label class="pf__label" for="mail_personal">Email Personal</label>
                <input
                  v-model="formData.mail_personal"
                  type="email"
                  class="pf__input"
                  id="mail_personal"
                  placeholder="Ingrese email personal"
                  :disabled="isLoading || !canEditSection('contacto')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('contacto') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="mail_operativo">Email Operativo</label>
                <input
                  v-model="formData.mail_operativo"
                  type="email"
                  class="pf__input"
                  id="mail_operativo"
                  placeholder="Ingrese email operativo"
                  :disabled="isLoading || !canEditSection('contacto')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('contacto') }"
                />
              </div>
            </div>
          </div>

          <!-- 3. Domicilio -->
          <div class="pf__acc-item">
            <button
              type="button"
              class="pf__acc-trigger"
              @click="toggleSection('domicilio')"
              :class="{ open: openSections.domicilio }"
            >
              <span class="pf__acc-left">
                <span class="pf__acc-icon pf__acc-icon--orange"><i class="bi bi-houses"></i></span>
                Domicilio
                <span v-if="!canEditSection('domicilio')" class="pf__readonly-tag"
                  >Solo lectura</span
                >
              </span>
              <i
                class="bi bi-chevron-down pf__chevron"
                :class="{ rotated: openSections.domicilio }"
              ></i>
            </button>
            <div class="pf__acc-body" v-show="openSections.domicilio">
              <div class="pf__field">
                <label class="pf__label" for="direccion1">Dirección 1</label>
                <input
                  v-model="formData.direccion1"
                  type="text"
                  class="pf__input"
                  id="direccion1"
                  placeholder="Ingrese dirección"
                  :disabled="isLoading || !canEditSection('domicilio')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('domicilio') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="barrio1">Barrio 1</label>
                <input
                  v-model="formData.barrio1"
                  type="text"
                  class="pf__input"
                  id="barrio1"
                  placeholder="Ingrese barrio"
                  :disabled="isLoading || !canEditSection('domicilio')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('domicilio') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="direccion2">Dirección 2</label>
                <input
                  v-model="formData.direccion2"
                  type="text"
                  class="pf__input"
                  id="direccion2"
                  placeholder="Ingrese dirección"
                  :disabled="isLoading || !canEditSection('domicilio')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('domicilio') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="barrio2">Barrio 2</label>
                <input
                  v-model="formData.barrio2"
                  type="text"
                  class="pf__input"
                  id="barrio2"
                  placeholder="Ingrese barrio"
                  :disabled="isLoading || !canEditSection('domicilio')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('domicilio') }"
                />
              </div>
            </div>
          </div>

          <!-- 4. Médicos -->
          <div class="pf__acc-item">
            <button
              type="button"
              class="pf__acc-trigger"
              @click="toggleSection('medicos')"
              :class="{ open: openSections.medicos }"
            >
              <span class="pf__acc-left">
                <span class="pf__acc-icon pf__acc-icon--red"
                  ><i class="bi bi-heart-pulse"></i
                ></span>
                Médicos
                <span v-if="!canEditSection('medicos')" class="pf__readonly-tag">Solo lectura</span>
              </span>
              <i
                class="bi bi-chevron-down pf__chevron"
                :class="{ rotated: openSections.medicos }"
              ></i>
            </button>
            <div class="pf__acc-body" v-show="openSections.medicos">
              <div class="pf__field">
                <label class="pf__label" for="obraSocial">Obra Social</label>
                <input
                  v-model="formData.obraSocial"
                  type="text"
                  class="pf__input"
                  id="obraSocial"
                  placeholder="Ingrese obra social"
                  :disabled="isLoading || !canEditSection('medicos')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('medicos') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="obraSocial_Plan">Plan Obra Social</label>
                <input
                  v-model="formData.obraSocial_Plan"
                  type="text"
                  class="pf__input"
                  id="obraSocial_Plan"
                  placeholder="Ingrese plan"
                  :disabled="isLoading || !canEditSection('medicos')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('medicos') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="obraSocial_id">ID Obra Social</label>
                <input
                  v-model="formData.obraSocial_id"
                  type="text"
                  class="pf__input"
                  id="obraSocial_id"
                  placeholder="Ingrese ID"
                  :disabled="isLoading || !canEditSection('medicos')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('medicos') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="obraSocial_Carnet">Carnet Obra Social</label>
                <input
                  v-model="formData.obraSocial_Carnet"
                  type="text"
                  class="pf__input"
                  id="obraSocial_Carnet"
                  placeholder="Ingrese carnet"
                  :disabled="isLoading || !canEditSection('medicos')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('medicos') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="med_dieta">Dieta</label>
                <input
                  v-model="formData.med_dieta"
                  type="text"
                  class="pf__input"
                  id="med_dieta"
                  list="dietas"
                  placeholder="Restricciones alimentarias.."
                  :disabled="isLoading || !canEditSection('medicos')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('medicos') }"
                />
                <datalist id="dietas">
                  <option v-for="dieta in Dietas" :key="dieta" :value="dieta"></option>
                </datalist>
              </div>
              <div class="pf__field">
                <label class="pf__label" for="med_sangre">Tipo de Sangre</label>
                <select
                  v-model="formData.med_sangre"
                  class="pf__input pf__select"
                  id="med_sangre"
                  :disabled="isLoading || !canEditSection('medicos')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('medicos') }"
                >
                  <option value=""></option>
                  <option v-for="tipo in tiposSangre" :key="tipo.value" :value="tipo.value">
                    {{ tipo.label }}
                  </option>
                </select>
              </div>
              <div class="pf__field">
                <label class="pf__label" for="med_historia">Historia Médica</label>
                <textarea
                  v-model="formData.med_historia"
                  class="pf__input pf__textarea"
                  id="med_historia"
                  placeholder="Antecedentes médicos"
                  :disabled="isLoading || !canEditSection('medicos')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('medicos') }"
                ></textarea>
              </div>
              <div class="pf__field">
                <label class="pf__label" for="med_problemas">Problemas de Salud</label>
                <textarea
                  v-model="formData.med_problemas"
                  class="pf__input pf__textarea"
                  id="med_problemas"
                  placeholder="Problemas actuales"
                  :disabled="isLoading || !canEditSection('medicos')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('medicos') }"
                ></textarea>
              </div>
              <div class="pf__field">
                <label class="pf__label" for="med_act">Actividad Física</label>
                <select
                  v-model="formData.med_act"
                  class="pf__input pf__select"
                  id="med_act"
                  :disabled="isLoading || !canEditSection('medicos')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('medicos') }"
                >
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div class="pf__field">
                <label class="pf__label" for="med_actLesion">Lesiones Actuales</label>
                <textarea
                  v-model="formData.med_actLesion"
                  class="pf__input pf__textarea"
                  id="med_actLesion"
                  placeholder="Ingrese lesiones"
                  :disabled="isLoading || !canEditSection('medicos')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('medicos') }"
                ></textarea>
              </div>
              <div class="pf__field">
                <label class="pf__label" for="foto_dni">Foto DNI</label>
                <input
                  v-model="formData.foto_dni"
                  type="text"
                  class="pf__input"
                  id="foto_dni"
                  placeholder="Ruta o URL de foto"
                  :disabled="isLoading || !canEditSection('medicos')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('medicos') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="foto_rostro">Foto Rostro</label>
                <input
                  v-model="formData.foto_rostro"
                  type="text"
                  class="pf__input"
                  id="foto_rostro"
                  placeholder="Ruta o URL de foto"
                  :disabled="isLoading || !canEditSection('medicos')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('medicos') }"
                />
              </div>

              <div class="pf__subsection">Estudios Médicos</div>

              <div class="pf__field">
                <label class="pf__label">Estudios Realizados</label>
                <div class="pf__checkboxes">
                  <label v-for="opt in estudiosOptions" :key="opt" class="pf__checkbox-label">
                    <input
                      type="checkbox"
                      :value="opt"
                      v-model="selectedEstudios"
                      class="pf__checkbox"
                      :disabled="isLoading || !canEditSection('medicos')"
                    />
                    <span>{{ opt }}</span>
                  </label>
                </div>
                <small class="pf__hint">Seleccionados: {{ formData.med_estudios }}</small>
              </div>
              <div class="pf__field">
                <label class="pf__label" for="med_estudios_extras">Otros Estudios</label>
                <input
                  v-model="formData.med_estudios_extras"
                  type="text"
                  class="pf__input"
                  id="med_estudios_extras"
                  placeholder="Ingrese otros"
                  :disabled="isLoading || !canEditSection('medicos')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('medicos') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="med_estudios_extraMotivo"
                  >Motivo Otros Estudios</label
                >
                <input
                  v-model="formData.med_estudios_extraMotivo"
                  type="text"
                  class="pf__input"
                  id="med_estudios_extraMotivo"
                  placeholder="Ingrese motivo"
                  :disabled="isLoading || !canEditSection('medicos')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('medicos') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="med_estudios_certificado">Certificado</label>
                <input
                  v-model="formData.med_estudios_certificado"
                  type="text"
                  class="pf__input"
                  id="med_estudios_certificado"
                  placeholder="Ingrese certificado"
                  :disabled="isLoading || !canEditSection('medicos')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('medicos') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="med_estudios_fechaEst">Fecha Estudio</label>
                <input
                  v-model="formData.med_estudios_fechaEst"
                  type="date"
                  class="pf__input"
                  id="med_estudios_fechaEst"
                  :disabled="isLoading || !canEditSection('medicos')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('medicos') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="med_estudios_img">Imagen (historia clínica)</label>
                <div class="pf__input-group">
                  <textarea
                    v-model="formData.med_estudios_img"
                    class="pf__input pf__textarea"
                    id="med_estudios_img"
                    placeholder="Ingrese observaciones / patologías"
                    rows="3"
                    :disabled="isLoading || !canEditSection('medicos')"
                    :class="{ 'pf__input--disabled': isLoading || !canEditSection('medicos') }"
                  ></textarea>
                  <button type="button" class="pf__img-preview-btn" @click="showImageModal = true">
                    <i class="bi bi-eye"></i>
                  </button>
                </div>
                <small class="pf__hint">La imagen mostrada es una referencia visual.</small>
              </div>
              <div class="pf__field">
                <label class="pf__label" for="med_estudios_otro">Comentarios</label>
                <input
                  v-model="formData.med_estudios_otro"
                  type="text"
                  class="pf__input"
                  id="med_estudios_otro"
                  placeholder="Ingrese otros datos"
                  :disabled="isLoading || !canEditSection('medicos')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('medicos') }"
                />
              </div>
            </div>
          </div>

          <!-- 5. Organización -->
          <div class="pf__acc-item">
            <button
              type="button"
              class="pf__acc-trigger"
              @click="toggleSection('organizacion')"
              :class="{ open: openSections.organizacion }"
            >
              <span class="pf__acc-left">
                <span class="pf__acc-icon pf__acc-icon--purple"
                  ><i class="bi bi-building"></i
                ></span>
                Organización
                <span v-if="!canEditSection('organizacion')" class="pf__readonly-tag"
                  >Solo lectura</span
                >
              </span>
              <i
                class="bi bi-chevron-down pf__chevron"
                :class="{ rotated: openSections.organizacion }"
              ></i>
            </button>
            <div class="pf__acc-body" v-show="openSections.organizacion">
              <div class="pf__field">
                <label class="pf__label" for="organizacion">Organización</label>
                <select
                  v-model="formData.organizacion"
                  class="pf__input pf__select"
                  id="organizacion"
                  :disabled="isLoading || !canEditSection('organizacion')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('organizacion') }"
                >
                  <option :value="org" v-for="org in organizaciones" :key="org">{{ org }}</option>
                </select>
              </div>
              <div class="pf__field">
                <label class="pf__label" for="areas_ref">Áreas de Referencia</label>
                <select
                  v-model="formData.areas_ref"
                  multiple
                  class="pf__input pf__select pf__select--multi"
                  id="areas_ref"
                  :disabled="isLoading || !canEditSection('organizacion') || !formData.organizacion"
                  :class="{
                    'pf__input--disabled':
                      isLoading || !canEditSection('organizacion') || !formData.organizacion,
                  }"
                  size="5"
                >
                  <option :value="area" v-for="area in areasRefDisponibles" :key="area">
                    {{ area }}
                  </option>
                </select>
                <small class="pf__hint">Seleccioná una o más áreas (Ctrl/Cmd + clic)</small>
              </div>
              <div class="pf__field">
                <label class="pf__label" for="areas">Roles</label>
                <select
                  v-model="formData.areas"
                  multiple
                  class="pf__input pf__select pf__select--multi"
                  id="areas"
                  :disabled="
                    isLoading || !canEditSection('organizacion') || formData.areas_ref.length === 0
                  "
                  :class="{
                    'pf__input--disabled':
                      isLoading ||
                      !canEditSection('organizacion') ||
                      formData.areas_ref.length === 0,
                  }"
                  size="5"
                >
                  <option :value="rol" v-for="rol in rolesDisponibles" :key="rol">{{ rol }}</option>
                </select>
                <small class="pf__hint">Seleccioná uno o más roles (Ctrl/Cmd + clic)</small>
              </div>
              <div class="pf__field">
                <label class="pf__label" for="apodo">Apodo</label>
                <input
                  v-model="formData.apodo"
                  type="text"
                  class="pf__input"
                  id="apodo"
                  placeholder="Ingrese apodo"
                  :disabled="isLoading || !canEditSection('organizacion')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('organizacion') }"
                />
              </div>
              <div class="pf__field pf__field--checkbox">
                <label class="pf__label" for="activo">¿Activo?</label>
                <input
                  v-model="formData.activo"
                  type="checkbox"
                  class="pf__toggle"
                  id="activo"
                  :disabled="isLoading || !canEditSection('organizacion')"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="nivel">Nivel</label>
                <input
                  v-model="formData.nivel"
                  type="number"
                  min="1"
                  max="5"
                  class="pf__input"
                  id="nivel"
                  placeholder="Ingrese nivel"
                  :disabled="isLoading || !canEditSection('organizacion')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('organizacion') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="nivelHBTJ">Nivel HBTJ</label>
                <select
                  v-model="formData.nivelHBTJ"
                  class="pf__input pf__select"
                  id="nivelHBTJ"
                  :disabled="isLoading || !canEditSection('organizacion')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('organizacion') }"
                >
                  <option :value="nvl" v-for="nvl in nivelesHBTJ" :key="nvl">{{ nvl }}</option>
                </select>
              </div>
              <div class="pf__field">
                <label class="pf__label" for="fecha_ingresoOrg">Fecha de Ingreso a Org</label>
                <input
                  v-model="formData.fecha_ingresoOrg"
                  type="date"
                  class="pf__input"
                  id="fecha_ingresoOrg"
                  :disabled="isLoading || !canEditSection('organizacion')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('organizacion') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="fecha_ingresoMilu">Fecha de Ingreso a Milu</label>
                <input
                  v-model="formData.fecha_ingresoMilu"
                  type="date"
                  class="pf__input"
                  id="fecha_ingresoMilu"
                  :disabled="isLoading || !canEditSection('organizacion')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('organizacion') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="areas_historicas">Áreas Históricas</label>
                <input
                  v-model="formData.areas_historicas"
                  type="text"
                  class="pf__input"
                  id="areas_historicas"
                  placeholder="Ingrese áreas históricas"
                  :disabled="isLoading || !canEditSection('organizacion')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('organizacion') }"
                />
              </div>

              <div class="pf__subsection">Cursos Realizados</div>

              <div class="pf__field">
                <label class="pf__label" for="curso_CB">Curso Básico</label>
                <input
                  v-model="formData.curso_CB"
                  type="text"
                  class="pf__input"
                  id="curso_CB"
                  placeholder="Ingrese datos del curso"
                  :disabled="isLoading || !canEditSection('organizacion')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('organizacion') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="curso_TL">Curso TL</label>
                <input
                  v-model="formData.curso_TL"
                  type="text"
                  class="pf__input"
                  id="curso_TL"
                  placeholder="Ingrese datos del curso"
                  :disabled="isLoading || !canEditSection('organizacion')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('organizacion') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="curso_AvH">Curso Avanzado H</label>
                <input
                  v-model="formData.curso_AvH"
                  type="text"
                  class="pf__input"
                  id="curso_AvH"
                  placeholder="Ingrese datos del curso"
                  :disabled="isLoading || !canEditSection('organizacion')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('organizacion') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="curso_AvKM">Curso Avanzado KM</label>
                <input
                  v-model="formData.curso_AvKM"
                  type="text"
                  class="pf__input"
                  id="curso_AvKM"
                  placeholder="Ingrese datos del curso"
                  :disabled="isLoading || !canEditSection('organizacion')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('organizacion') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="curso_IE">Curso IE</label>
                <input
                  v-model="formData.curso_IE"
                  type="text"
                  class="pf__input"
                  id="curso_IE"
                  placeholder="Ingrese datos del curso"
                  :disabled="isLoading || !canEditSection('organizacion')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('organizacion') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="curso_FND">Curso FND</label>
                <input
                  v-model="formData.curso_FND"
                  type="text"
                  class="pf__input"
                  id="curso_FND"
                  placeholder="Ingrese datos del curso"
                  :disabled="isLoading || !canEditSection('organizacion')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('organizacion') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="curso_IEIns">Curso IE-Ins</label>
                <input
                  v-model="formData.curso_IEIns"
                  type="text"
                  class="pf__input"
                  id="curso_IEIns"
                  placeholder="Ingrese datos del curso"
                  :disabled="isLoading || !canEditSection('organizacion')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('organizacion') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="curso_CR">Curso CR</label>
                <input
                  v-model="formData.curso_CR"
                  type="text"
                  class="pf__input"
                  id="curso_CR"
                  placeholder="Ingrese datos del curso"
                  :disabled="isLoading || !canEditSection('organizacion')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('organizacion') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="curso_CARE">Curso CARE</label>
                <input
                  v-model="formData.curso_CARE"
                  type="text"
                  class="pf__input"
                  id="curso_CARE"
                  placeholder="Ingrese datos del curso"
                  :disabled="isLoading || !canEditSection('organizacion')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('organizacion') }"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="cursos_tiempo">Duración Cursos</label>
                <input
                  v-model="formData.cursos_tiempo"
                  type="text"
                  class="pf__input"
                  id="cursos_tiempo"
                  placeholder="Ingrese duración total"
                  :disabled="isLoading || !canEditSection('organizacion')"
                  :class="{ 'pf__input--disabled': isLoading || !canEditSection('organizacion') }"
                />
              </div>
            </div>
          </div>

          <!-- 6. Vida y Desarrollo -->
          <div class="pf__acc-item">
            <button
              type="button"
              class="pf__acc-trigger"
              @click="toggleSection('desarrollo')"
              :class="{ open: openSections.desarrollo }"
            >
              <span class="pf__acc-left">
                <span class="pf__acc-icon pf__acc-icon--teal"><i class="bi bi-book"></i></span>
                Vida y Desarrollo
                <span v-if="!canEditSection('desarrollo')" class="pf__readonly-tag"
                  >Solo lectura</span
                >
              </span>
              <i
                class="bi bi-chevron-down pf__chevron"
                :class="{ rotated: openSections.desarrollo }"
              ></i>
            </button>
            <div class="pf__acc-body" v-show="openSections.desarrollo">
              <div class="pf__subsection">Estudios</div>
              <div class="pf__field">
                <label class="pf__label" for="estudios_grado"
                  >Mayor grado de estudios alcanzado</label
                >
                <select
                  id="estudios_grado"
                  v-model="formData.estudios_grado"
                  class="pf__input pf__select"
                >
                  <option value="Primario">Primario</option>
                  <option value="Secundario">Secundario</option>
                  <option value="Terciario">Terciario</option>
                  <option value="Universitario">Universitario</option>
                  <option value="Posgrado">Posgrado</option>
                </select>
              </div>
              <div class="pf__field">
                <label class="pf__label" for="estudios_area">Área de Estudios</label>
                <select
                  id="estudios_area"
                  v-model="formData.estudios_area"
                  class="pf__input pf__select"
                >
                  <option value=""></option>
                  <option v-for="carreer in Estudies" :value="carreer" :key="carreer">
                    {{ carreer }}
                  </option>
                </select>
              </div>
              <div class="pf__field">
                <label class="pf__label" for="estudios_carrera">Nombre de la carrera</label>
                <input
                  id="estudios_carrera"
                  v-model="formData.estudios_carrera"
                  class="pf__input"
                  type="text"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="estudios_barrio">Barrio donde estudia</label>
                <input
                  id="estudios_barrio"
                  v-model="formData.estudios_barrio"
                  class="pf__input"
                  type="text"
                />
              </div>
              <div class="pf__subsection">Trabajo</div>
              <div class="pf__field">
                <label class="pf__label" for="trabajo_area">Área del Trabajo</label>
                <select
                  v-model="formData.trabajo_area"
                  id="trabajo_area"
                  class="pf__input pf__select"
                >
                  <option value=""></option>
                  <option v-for="work in Works" :value="work" :key="work">{{ work }}</option>
                </select>
              </div>
              <div class="pf__field">
                <label class="pf__label" for="trabajo_puesto">Puesto de trabajo</label>
                <input
                  type="text"
                  v-model="formData.trabajo_puesto"
                  id="trabajo_puesto"
                  class="pf__input"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="trabajo_barrio">Barrio donde trabaja</label>
                <input
                  type="text"
                  v-model="formData.trabajo_barrio"
                  class="pf__input"
                  id="trabajo_barrio"
                />
              </div>
              <div class="pf__subsection">Comunidad</div>
              <div class="pf__field">
                <label class="pf__label" for="comunidad_rol"
                  >¿Tenés algún rol en la Comunidad?</label
                >
                <textarea
                  class="pf__input pf__textarea"
                  v-model="formData.comunidad_rol"
                  id="comunidad_rol"
                  placeholder="CISSAB - Madrij&#10;Tarbut - Profesor"
                ></textarea>
                <small class="pf__hint">Si es así, indicá cuáles y dónde</small>
              </div>
            </div>
          </div>

          <!-- 7. Familia -->
          <div class="pf__acc-item">
            <button
              type="button"
              class="pf__acc-trigger"
              @click="toggleSection('familia')"
              :class="{ open: openSections.familia }"
            >
              <span class="pf__acc-left">
                <span class="pf__acc-icon pf__acc-icon--amber"><i class="bi bi-people"></i></span>
                Familia
                <span v-if="!canEditSection('familia')" class="pf__readonly-tag">Solo lectura</span>
              </span>
              <i
                class="bi bi-chevron-down pf__chevron"
                :class="{ rotated: openSections.familia }"
              ></i>
            </button>
            <div class="pf__acc-body" v-show="openSections.familia">
              <div class="pf__subsection">Familiar 1</div>
              <div class="pf__field">
                <label class="pf__label" for="fam1_nombre">Nombre</label>
                <input
                  type="text"
                  id="fam1_nombre"
                  v-model="formData.fam1_nombre"
                  class="pf__input"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="fam1_apellido">Apellido</label>
                <input
                  type="text"
                  id="fam1_apellido"
                  v-model="formData.fam1_apellido"
                  class="pf__input"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="fam1_vinculo">Vínculo con el Javer</label>
                <input
                  type="text"
                  id="fam1_vinculo"
                  v-model="formData.fam1_vinculo"
                  class="pf__input"
                  placeholder="Madre/Padre/Hermano"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="fam1_celular">Celular</label>
                <div class="pf__input-group">
                  <select
                    v-model="formData.fam1_celular_countryCode"
                    class="pf__input pf__select pf__input-group-select"
                    :disabled="isLoading || !canEditSection('familia')"
                    :class="{ 'pf__input--disabled': isLoading || !canEditSection('familia') }"
                  >
                    <option
                      v-for="country in COUNTRIES_CODES"
                      :key="country.code"
                      :value="country.code"
                    >
                      +{{ country.dial_code }} {{ country.emoji }}
                    </option>
                  </select>
                  <input
                    type="tel"
                    id="fam1_celular"
                    v-model="formData.fam1_celular"
                    class="pf__input pf__input-group-main"
                    placeholder="1155554444"
                    :disabled="isLoading || !canEditSection('familia')"
                    :class="{ 'pf__input--disabled': isLoading || !canEditSection('familia') }"
                  />
                </div>
                <small class="pf__hint"
                  >Seleccioná el país y luego ingresá el número sin código de país</small
                >
              </div>
              <div class="pf__field">
                <label class="pf__label" for="fam1_direccion">Dirección</label>
                <input
                  type="address"
                  id="fam1_direccion"
                  v-model="formData.fam1_direccion"
                  class="pf__input"
                  placeholder="Av. Corrientes 123..."
                />
              </div>

              <div class="pf__subsection">Familiar 2</div>
              <div class="pf__field">
                <label class="pf__label" for="fam2_nombre">Nombre</label>
                <input
                  type="text"
                  id="fam2_nombre"
                  v-model="formData.fam2_nombre"
                  class="pf__input"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="fam2_apellido">Apellido</label>
                <input
                  type="text"
                  id="fam2_apellido"
                  v-model="formData.fam2_apellido"
                  class="pf__input"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="fam2_vinculo">Vínculo con el Javer</label>
                <input
                  type="text"
                  id="fam2_vinculo"
                  v-model="formData.fam2_vinculo"
                  class="pf__input"
                  placeholder="Madre/Padre/Hermano"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="fam2_celular">Celular</label>
                <div class="pf__input-group">
                  <select
                    v-model="formData.fam2_celular_countryCode"
                    class="pf__input pf__select pf__input-group-select"
                    :disabled="isLoading || !canEditSection('familia')"
                    :class="{ 'pf__input--disabled': isLoading || !canEditSection('familia') }"
                  >
                    <option
                      v-for="country in COUNTRIES_CODES"
                      :key="country.code"
                      :value="country.code"
                    >
                      +{{ country.dial_code }} {{ country.emoji }}
                    </option>
                  </select>
                  <input
                    type="tel"
                    id="fam2_celular"
                    v-model="formData.fam2_celular"
                    class="pf__input pf__input-group-main"
                    placeholder="1155554444"
                    :disabled="isLoading || !canEditSection('familia')"
                    :class="{ 'pf__input--disabled': isLoading || !canEditSection('familia') }"
                  />
                </div>
                <small class="pf__hint"
                  >Seleccioná el país y luego ingresá el número sin código de país</small
                >
              </div>
              <div class="pf__field">
                <label class="pf__label" for="fam2_direccion">Dirección</label>
                <input
                  type="address"
                  id="fam2_direccion"
                  v-model="formData.fam2_direccion"
                  class="pf__input"
                  placeholder="Av. Corrientes 123..."
                />
              </div>
            </div>
          </div>

          <!-- 8. Técnicos -->
          <div v-if="canEditSection('tecnicos')" class="pf__acc-item">
            <button
              type="button"
              class="pf__acc-trigger"
              @click="toggleSection('tecnicos')"
              :class="{ open: openSections.tecnicos }"
            >
              <span class="pf__acc-left">
                <span class="pf__acc-icon pf__acc-icon--gray"><i class="bi bi-gear"></i></span>
                Técnicos
              </span>
              <i
                class="bi bi-chevron-down pf__chevron"
                :class="{ rotated: openSections.tecnicos }"
              ></i>
            </button>
            <div class="pf__acc-body" v-show="openSections.tecnicos">
              <div class="pf__field">
                <label class="pf__label" for="ID_JVR">ID JVR</label>
                <div class="pf__input-group">
                  <select
                    id="ID_JVR"
                    v-model="formData.organizacion"
                    class="pf__input pf__select pf__input-group-select pf__input--disabled"
                    disabled="true"
                  >
                    <option value="JVR"></option>
                    <option v-for="org in organizaciones" :key="org" :value="org">{{ org }}</option>
                  </select>
                  <span class="pf__input-group-sep">@</span>
                  <input
                    v-model="formData.DNI"
                    type="number"
                    class="pf__input pf__input-group-main pf__input--disabled"
                    placeholder="DNI"
                    min="1000000"
                    max="99999999"
                    disabled="true"
                  />
                </div>
              </div>
              <div class="pf__field">
                <label class="pf__label" for="telegram_id">Telegram ID</label>
                <input
                  type="number"
                  id="telegram_id"
                  v-model="formData.telegram_id"
                  class="pf__input"
                  min="1000000"
                  max="99999999999"
                />
              </div>
              <div class="pf__field">
                <label class="pf__label" for="it_level">Nivel IT App</label>
                <select
                  id="it_level"
                  class="pf__input pf__select pf__input--disabled"
                  disabled="true"
                >
                  <option value=""></option>
                </select>
              </div>
              <div class="pf__field">
                <label class="pf__label" for="fecha_ult">Última modificación</label>
                <input
                  type="datetime-local"
                  class="pf__input pf__input--disabled"
                  id="fecha_ult"
                  v-model="formData.fecha_ult"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Mensajes -->
        <div v-if="successMessage" class="pf__message pf__message--success">
          <i class="bi bi-check-circle"></i> {{ successMessage }}
          <button type="button" class="pf__message-close" @click="successMessage = ''">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div v-if="errorMessage" class="pf__message pf__message--error">
          <i class="bi bi-exclamation-circle"></i> {{ errorMessage }}
          <button type="button" class="pf__message-close" @click="errorMessage = ''">
            <i class="bi bi-x"></i>
          </button>
        </div>

        <!-- Botones de acción -->
        <div class="pf__actions">
          <button type="submit" class="pf__submit-btn" :disabled="isLoading || !canEditAny">
            <span v-if="!isLoading"><i class="bi bi-check-circle"></i> Actualizar Datos</span>
            <span v-else class="pf__loading-text">
              <span class="pf__spinner-sm"></span> Guardando...
            </span>
          </button>
          <button type="button" class="pf__cancel-btn" @click="close" :disabled="isLoading">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal imagen -->
  <div v-if="showImageModal" class="pf-modal-backdrop" @click.self="showImageModal = false">
    <div class="pf-modal">
      <div class="pf-modal__header">
        <h5>Imagen</h5>
        <button class="pf__close" @click="showImageModal = false">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="pf-modal__body">
        <img
          src="https://picsum.photos/200/300"
          alt="Imagen estudio"
          style="max-width: 100%; max-height: 70vh; border-radius: 8px"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, reactive } from 'vue'
import { update, getAll } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/composables/usePermissions'
import {
  tiposSangre,
  organizaciones,
  nivelesHBTJ,
  Works,
  Estudies,
  Dietas,
  formatFecha,
  parseFechaToISO,
  parseFechaEnteraToISO,
} from '@/utils/forms_consts'

import { capitalizarEsp } from '@/utils/strings'

import {
  COUNTRIES_CODES,
  formatPhoneNumber,
  extractCountryCode,
  extractLocalNumber,
} from '@/utils/phone'

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
  canEditSection: {
    type: Function,
    default: () => true,
  },
  canSeeTechnical: {
    type: Function,
    default: () => false,
  },
})

// Emits
const emit = defineEmits(['update', 'close'])

// Estado
const isOpen = ref(false)
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const offcanvasId = `profileForm-${Math.random().toString(36).slice(2, 9)}`
const hasSaved = ref(false)

// Acordeones
const openSections = reactive({
  personal: true,
  contacto: false,
  domicilio: false,
  medicos: false,
  organizacion: false,
  desarrollo: false,
  familia: false,
  tecnicos: false,
})

const toggleSection = (section) => {
  openSections[section] = !openSections[section]
}

// Datos de mjlkt
const mjlktData = ref([])
const areasRefDisponibles = computed(() => {
  const org = formData.value.organizacion
  if (!org) return []
  return [
    ...new Set(mjlktData.value.filter((item) => item.org === org).map((item) => item.area)),
  ].sort()
})
const rolesDisponibles = computed(() => {
  const org = formData.value.organizacion
  const areasRef = formData.value.areas_ref
  if (!org || !Array.isArray(areasRef) || areasRef.length === 0) return []
  return [
    ...new Set(
      mjlktData.value
        .filter((item) => item.org === org && areasRef.includes(item.area))
        .map((item) => item.rol),
    ),
  ].sort()
})

// Computed: verificar si puede editar al menos una sección
const canEditAny = computed(() => {
  const sections = [
    'personal',
    'contacto',
    'domicilio',
    'medicos',
    'desarrollo',
    'familia',
    'organizacion',
    'tecnicos',
  ]
  return sections.some((section) => props.canEditSection(section))
})

// Formulario
const formData = ref({
  DNI: null,
  dni: null,
  CUIL: '',
  nombre: '',
  apellido: '',
  nacimiento: '',
  genero: '',
  celular: '',
  celular_countryCode: 'AR',
  mail_personal: '',
  mail_operativo: '',
  direccion1: '',
  barrio1: '',
  direccion2: '',
  barrio2: '',
  obraSocial: '',
  obraSocial_Plan: '',
  obraSocial_id: '',
  obraSocial_Carnet: '',
  med_dieta: '',
  med_sangre: '',
  med_historia: '',
  med_problemas: '',
  med_act: '',
  med_actLesion: '',
  foto_dni: '',
  foto_rostro: '',
  med_estudios: '',
  med_estudios_extras: '',
  med_estudios_extraMotivo: '',
  med_estudios_pdf: '',
  med_estudios_certificado: '',
  med_estudios_fecha: '',
  med_estudios_img: '',
  med_estudios_otro: '',
  organizacion: '',
  areas_ref: [],
  areas: [],
  apodo: '',
  activo: '',
  nivel: '',
  nivelHBTJ: '',
  fecha_ingresoOrg: '',
  fecha_ingresoMilu: '',
  curso_CB: '',
  areas_historicas: '',
  curso_TL: '',
  curso_AvH: '',
  curso_AvKM: '',
  curso_IE: '',
  curso_FND: '',
  curso_IEIns: '',
  curso_CR: '',
  curso_CARE: '',
  cursos_tiempo: '',
  estudios_grado: '',
  estudios_area: '',
  estudios_carrera: '',
  estudios_barrio: '',
  trabajo_area: '',
  trabajo_puesto: '',
  trabajo_barrio: '',
  comunidad_rol: '',
  fam1_nombre: '',
  fam1_apellido: '',
  fam1_vinculo: '',
  fam1_celular: '',
  fam1_celular_countryCode: 'AR',
  fam1_direccion: '',
  fam2_nombre: '',
  fam2_apellido: '',
  fam2_vinculo: '',
  fam2_celular: '',
  fam2_celular_countryCode: 'AR',
  fam2_direccion: '',
  ID_JVR: '',
  telegram_id: '',
  it_level: '',
  fecha_ult: '',
})

const estudiosOptions = [
  'Laboratorio completo',
  'Ergometría de 12 deriv.',
  'Ecodoppler',
  'Radiografía de Tórax',
  'Ecoestress o Perfusión Miocárdica',
]
const selectedEstudios = ref([])
const showImageModal = ref(false)

watch(selectedEstudios, (newVal) => {
  formData.value.med_estudios = newVal.join(', ')
})

watch(
  () => props.profileData,
  (newData) => {
    try {
      if (hasSaved.value) return
      if (newData && Object.keys(newData).length > 0) {
        const normalizeFecha = (fecha) => {
          if (!fecha) return ''
          if (/^\d{4}-\d{2}-\d{2}/.test(fecha)) return fecha.split('T')[0]
          if (/^\d{2}\/\d{2}\/\d{4}/.test(fecha)) {
            const parts = fecha.split('/')
            return `${parts[2]}-${parts[1]}-${parts[0]}`
          }
          return fecha
        }
        const parseAreas = (areasData) => {
          if (Array.isArray(areasData)) return areasData
          if (typeof areasData === 'string' && areasData.trim()) {
            return areasData
              .split(',')
              .map((a) => a.trim())
              .filter(Boolean)
          }
          return []
        }
        formData.value = {
          DNI: newData.DNI || newData.dni,
          dni: newData.dni || newData.DNI,
          CUIL: newData.CUIL || '',
          nombre: newData.nombre || '',
          apellido: newData.apellido || '',
          nacimiento: normalizeFecha(newData.nacimiento),
          genero: newData.genero || '',
          celular: (() => {
            const extracted = extractLocalNumber(newData.celular)
            return extracted || ''
          })(),
          celular_countryCode: extractCountryCode(newData.celular) || 'AR',
          mail_personal: newData.mail_personal || '',
          mail_operativo: newData.mail_operativo || '',
          direccion1: newData.direccion1 || '',
          barrio1: newData.barrio1 || '',
          direccion2: newData.direccion2 || '',
          barrio2: newData.barrio2 || '',
          obraSocial: newData.obraSocial || '',
          obraSocial_Plan: newData.obraSocial_Plan || '',
          obraSocial_id: newData.obraSocial_id || '',
          obraSocial_Carnet: newData.obraSocial_Carnet || '',
          med_dieta: newData.med_dieta || '',
          med_sangre: newData.med_sangre || '',
          med_historia: newData.med_historia || '',
          med_problemas: newData.med_problemas || '',
          med_act: newData.med_act || '',
          med_actLesion: newData.med_actLesion || '',
          foto_dni: newData.foto_dni || '',
          foto_rostro: newData.foto_rostro || '',
          med_estudios: newData.med_estudios || '',
          med_estudios_extras: newData.med_estudios_extras || '',
          med_estudios_extraMotivo: newData.med_estudios_extraMotivo || '',
          med_estudios_pdf: newData.med_estudios_pdf || '',
          med_estudios_certificado: newData.med_estudios_certificado || '',
          med_estudios_fecha: normalizeFecha(newData.med_estudios_fecha),
          med_aclararimg: newData.med_aclararimg || '',
          med_estudios_img: newData.med_estudios_img || '',
          med_estudios_otro: newData.med_estudios_otro || '',
          organizacion: newData.organizacion || '',
          areas_ref: parseAreas(newData.areas_ref),
          areas: parseAreas(newData.areas),
          apodo: newData.apodo || '',
          activo: Boolean(newData.activo),
          nivel: newData.nivel || '',
          nivelHBTJ: newData.nivelHBTJ || '',
          fecha_ingresoOrg: normalizeFecha(newData.fecha_ingresoOrg),
          fecha_ingresoMilu: normalizeFecha(newData.fecha_ingresoMilu),
          areas_historicas: newData.areas_historicas || '',
          curso_CB: newData.curso_CB || '',
          curso_TL: newData.curso_TL || '',
          curso_AvH: newData.curso_AvH || '',
          curso_AvKM: newData.curso_AvKM || '',
          curso_IE: newData.curso_IE || '',
          curso_FND: newData.curso_FND || '',
          curso_IEIns: newData.curso_IEIns || '',
          curso_CR: newData.curso_CR || '',
          curso_CARE: newData.curso_CARE || '',
          cursos_tiempo: newData.cursos_tiempo || '',
          estudios_grado: newData.estudios_grado || '',
          estudios_area: newData.estudios_area || '',
          estudios_carrera: capitalizarEsp(newData.estudios_carrera) || '',
          estudios_barrio: capitalizarEsp(newData.estudios_barrio) || '',
          trabajo_area: newData.trabajo_area || '',
          trabajo_puesto: newData.trabajo_puesto || '',
          trabajo_barrio: newData.trabajo_barrio || '',
          comunidad_rol: newData.comunidad_rol || '',
          fam1_nombre: newData.fam1_nombre || '',
          fam1_apellido: newData.fam1_apellido || '',
          fam1_vinculo: newData.fam1_vinculo || '',
          fam1_celular: extractLocalNumber(newData.fam1_celular) || '',
          fam1_celular_countryCode: extractCountryCode(newData.fam1_celular) || 'AR',
          fam1_direccion: newData.fam1_direccion || '',
          fam2_nombre: newData.fam2_nombre || '',
          fam2_apellido: newData.fam2_apellido || '',
          fam2_vinculo: newData.fam2_vinculo || '',
          fam2_celular: extractLocalNumber(newData.fam2_celular) || '',
          fam2_celular_countryCode: extractCountryCode(newData.fam2_celular) || 'AR',
          fam2_direccion: newData.fam2_direccion || '',
          ID_JVR: newData.DNI ? `${newData.organizacion || 'JVR'}@${newData.DNI}` : '',
          telegram_id: newData.telegram_id || '',
          fecha_ult: parseFechaEnteraToISO(newData.fecha_ult) || '',
        }
        selectedEstudios.value = formData.value.med_estudios
          ? String(formData.value.med_estudios)
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : []
      }
    } catch (error) {
      console.error('Error processing profileData in watcher:', error)
    }
  },
  { deep: true, immediate: true },
)

const loadMjlktData = async () => {
  try {
    const response = await getAll('mjlkt')
    mjlktData.value = response.data || []
  } catch (error) {
    console.error('Error loading mjlkt data:', error)
  }
}

const getNowFormatted = () => {
  const now = new Date()
  const datePart = now
    .toLocaleDateString('es-AR')
    .split('/')
    .map((p) => p.padStart(2, '0'))
    .join('/')
  const timePart = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  return {
    display: `${datePart} ${timePart}`,
    iso: new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16),
  }
}

const open = async () => {
  hasSaved.value = false
  isOpen.value = true
  if (formData.value.fecha_ult) {
    if (!formData.value.fecha_ult.includes('T')) {
      formData.value.fecha_ult = `${formData.value.fecha_ult}T00:00`
    }
  } else {
    formData.value.fecha_ult = getNowFormatted().iso
  }
  if (mjlktData.value.length === 0) {
    await loadMjlktData()
  }
}

const close = () => {
  isOpen.value = false
  successMessage.value = ''
  errorMessage.value = ''
}

const normalizePhoneNumber = (phoneNumber, countryCode) => {
  if (!phoneNumber) return ''
  let phoneStr = phoneNumber
  if (Array.isArray(phoneNumber)) phoneStr = phoneNumber[0] || ''
  if (typeof phoneStr !== 'string') phoneStr = String(phoneStr)
  const trimmed = phoneStr.trim()
  if (!trimmed) return ''
  try {
    const formatted = formatPhoneNumber(trimmed, countryCode)
    return formatted || ''
  } catch (error) {
    console.error(`Error formatting phone number: ${error}`)
    return ''
  }
}

const handleSubmit = async () => {
  try {
    errorMessage.value = ''
    successMessage.value = ''
    if (!formData.value.nombre || !formData.value.apellido) {
      errorMessage.value = 'Por favor completá nombre y apellido'
      return
    }
    if (formData.value.celular && !formData.value.celular_countryCode) {
      errorMessage.value = 'Por favor seleccioná un país para el celular'
      return
    }
    if (formData.value.fam1_celular && !formData.value.fam1_celular_countryCode) {
      errorMessage.value = 'Por favor seleccioná un país para el celular del familiar 1'
      return
    }
    if (formData.value.fam2_celular && !formData.value.fam2_celular_countryCode) {
      errorMessage.value = 'Por favor seleccioná un país para el celular del familiar 2'
      return
    }
    isLoading.value = true
    formData.value.fecha_ult = getNowFormatted().iso
    console.log(formData.value.areas)
    const mainData = {
      DNI: formData.value.DNI,
      CUIL: formData.value.CUIL,
      nombre: capitalizarEsp(formData.value.nombre),
      apellido: capitalizarEsp(formData.value.apellido),
      nacimiento: parseFechaToISO(formData.value.nacimiento),
      genero: formData.value.genero,
      celular: normalizePhoneNumber(formData.value.celular, formData.value.celular_countryCode),
      mail_personal: formData.value.mail_personal,
      mail_operativo: formData.value.mail_operativo,
      direccion1: capitalizarEsp(formData.value.direccion1),
      barrio1: capitalizarEsp(formData.value.barrio1),
      direccion2: capitalizarEsp(formData.value.direccion2),
      barrio2: capitalizarEsp(formData.value.barrio2),
      obraSocial: formData.value.obraSocial,
      obraSocial_Plan: formData.value.obraSocial_Plan,
      obraSocial_id: formData.value.obraSocial_id,
      obraSocial_Carnet: formData.value.obraSocial_Carnet,
      med_dieta: formData.value.med_dieta,
      med_sangre: formData.value.med_sangre,
      med_historia: formData.value.med_historia,
      med_problemas: formData.value.med_problemas,
      med_act: formData.value.med_act,
      med_actLesion: formData.value.med_actLesion,
      foto_dni: formData.value.foto_dni,
      foto_rostro: formData.value.foto_rostro,
      med_estudios: formData.value.med_estudios,
      med_estudios_extras: formData.value.med_estudios_extras,
      med_estudios_extraMotivo: formData.value.med_estudios_extraMotivo,
      med_estudios_pdf: formData.value.med_estudios_pdf,
      med_estudios_certificado: formData.value.med_estudios_certificado,
      med_estudios_fecha: parseFechaToISO(formData.value.med_estudios_fecha),
      med_estudios_img: formData.value.med_estudios_img,
      med_estudios_otro: formData.value.med_estudios_otro,
      organizacion: formData.value.organizacion,
      areas_ref: Array.isArray(formData.value.areas_ref)
        ? formData.value.areas_ref.join(', ')
        : formData.value.areas_ref,
      areas: Array.isArray(formData.value.areas)
        ? formData.value.areas.join(', ')
        : formData.value.areas,
      apodo: formData.value.apodo,
      activo: formData.value.activo === true ? 1 : 0,
      nivel: formData.value.nivel,
      nivelHBTJ: formData.value.nivelHBTJ,
      fecha_ingresoOrg: parseFechaToISO(formData.value.fecha_ingresoOrg),
      fecha_ingresoMilu: parseFechaToISO(formData.value.fecha_ingresoMilu),
      areas_historicas: formData.value.areas_historicas,
      curso_CB: formData.value.curso_CB,
      curso_TL: formData.value.curso_TL,
      curso_AvH: formData.value.curso_AvH,
      curso_AvKM: formData.value.curso_AvKM,
      curso_IE: formData.value.curso_IE,
      curso_FND: formData.value.curso_FND,
      curso_IEIns: formData.value.curso_IEIns,
      curso_CR: formData.value.curso_CR,
      curso_CARE: formData.value.curso_CARE,
      cursos_tiempo: formData.value.cursos_tiempo,
      estudios_grado: formData.value.estudios_grado,
      estudios_area: formData.value.estudios_area,
      estudios_carrera: capitalizarEsp(formData.value.estudios_carrera),
      estudios_barrio: capitalizarEsp(formData.value.estudios_barrio),
      trabajo_area: formData.value.trabajo_area,
      trabajo_puesto: capitalizarEsp(formData.value.trabajo_puesto),
      trabajo_barrio: capitalizarEsp(formData.value.trabajo_barrio),
      comunidad_rol: formData.value.comunidad_rol,
      fam1_nombre: capitalizarEsp(formData.value.fam1_nombre),
      fam1_apellido: capitalizarEsp(formData.value.fam1_apellido),
      fam1_vinculo: formData.value.fam1_vinculo,
      fam1_celular: normalizePhoneNumber(
        formData.value.fam1_celular,
        formData.value.fam1_celular_countryCode,
      ),
      fam1_direccion: capitalizarEsp(formData.value.fam1_direccion),
      fam2_nombre: capitalizarEsp(formData.value.fam2_nombre),
      fam2_apellido: capitalizarEsp(formData.value.fam2_apellido),
      fam2_vinculo: formData.value.fam2_vinculo,
      fam2_celular: normalizePhoneNumber(
        formData.value.fam2_celular,
        formData.value.fam2_celular_countryCode,
      ),
      fam2_direccion: capitalizarEsp(formData.value.fam2_direccion),
      ID_JVR: (formData.value.organizacion || 'JVR') + '@' + formData.value.dni || '',
      telegram_id: formData.value.telegram_id,
      fecha_ult: parseFechaEnteraToISO(formData.value.fecha_ult),
    }
    await update('main', mainData)
    try {
      await update('users', {
        dni: formData.value.dni,
        email: formData.value.mail_operativo || formData.value.mail_personal,
        cellphone: normalizePhoneNumber(formData.value.celular, formData.value.celular_countryCode),
      })
    } catch (err) {
      console.log('No se actualizó en users (puede no existir)')
    }
    hasSaved.value = true
    successMessage.value = 'Datos actualizados correctamente'
    emit('update', {
      ...formData.value,
      areas: Array.isArray(formData.value.areas)
        ? formData.value.areas.join(', ')
        : formData.value.areas,
      areas_ref: Array.isArray(formData.value.areas_ref)
        ? formData.value.areas_ref.join(', ')
        : formData.value.areas_ref,
    })
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

defineExpose({ open, close })
</script>

<style scoped>
/* ── Variables ── */
.pf {
  --pf-bg: #ffffff;
  --pf-header-bg: #1a1d2e;
  --pf-border: #e5e9f2;
  --pf-text: #1a1d2e;
  --pf-text-muted: #6b7280;
  --pf-accent: #4361ee;
  --pf-radius: 10px;
  --pf-width: 420px;

  position: fixed;
  top: 0;
  right: 0;
  width: var(--pf-width);
  height: 100dvh;
  background: var(--pf-bg);
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.15);
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1050;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.pf--open {
  transform: translateX(0);
}

/* Backdrop */
.pf-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  z-index: 1049;
}

/* ── Header ── */
.pf__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: var(--pf-header-bg);
  color: white;
  flex-shrink: 0;
}

.pf__header-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.pf__header-icon {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.12);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
}

.pf__header-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
  color: white;
}

.pf__close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0.2rem;
  font-size: 0.85rem;
  transition: color 0.15s;
  line-height: 1;
}

.pf__close:hover {
  color: white;
}

/* ── Body / Scroll ── */
.pf__body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  -webkit-overflow-scrolling: touch;
}

/* ── Accordion ── */
.pf__accordion {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.pf__acc-item {
  border: 1px solid var(--pf-border);
  border-radius: var(--pf-radius);
  overflow: hidden;
}

.pf__acc-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--pf-text);
  text-align: left;
  transition: background 0.15s;
}

.pf__acc-trigger:hover {
  background: #eef2ff;
}
.pf__acc-trigger.open {
  border-bottom: 1px solid var(--pf-border);
  background: #eef2ff;
}

.pf__acc-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  overflow: hidden;
}

.pf__acc-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  flex-shrink: 0;
}

.pf__acc-icon--blue {
  background: #dbeafe;
  color: #1e40af;
}
.pf__acc-icon--green {
  background: #dcfce7;
  color: #166534;
}
.pf__acc-icon--orange {
  background: #ffedd5;
  color: #9a3412;
}
.pf__acc-icon--red {
  background: #fee2e2;
  color: #991b1b;
}
.pf__acc-icon--purple {
  background: #ede9fe;
  color: #5b21b6;
}
.pf__acc-icon--teal {
  background: #ccfbf1;
  color: #0f766e;
}
.pf__acc-icon--amber {
  background: #fef9c3;
  color: #854d0e;
}
.pf__acc-icon--gray {
  background: #f1f5f9;
  color: #475569;
}

.pf__readonly-tag {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.1rem 0.45rem;
  border-radius: 5px;
  background: #f1f5f9;
  color: var(--pf-text-muted);
  margin-left: auto;
  flex-shrink: 0;
}

.pf__chevron {
  color: var(--pf-text-muted);
  font-size: 0.72rem;
  transition: transform 0.25s;
  flex-shrink: 0;
}

.pf__chevron.rotated {
  transform: rotate(180deg);
}

.pf__acc-body {
  padding: 0.85rem 1rem;
  background: white;
}

/* ── Fields ── */
.pf__field {
  margin-bottom: 0.85rem;
}

.pf__field:last-child {
  margin-bottom: 0;
}

.pf__field--checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pf__label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--pf-text-muted);
  margin-bottom: 0.3rem;
}

.pf__field--checkbox .pf__label {
  margin-bottom: 0;
}

.pf__input {
  width: 100%;
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--pf-border);
  border-radius: 7px;
  font-size: 0.875rem;
  color: var(--pf-text);
  background: white;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  box-sizing: border-box;
  font-family: inherit;
}

.pf__input:focus {
  outline: none;
  border-color: var(--pf-accent);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

.pf__input--disabled {
  background: #f8fafc;
  color: var(--pf-text-muted);
  cursor: not-allowed;
}

.pf__select {
  appearance: auto;
}

.pf__select--multi {
  height: auto;
}

.pf__textarea {
  resize: vertical;
  min-height: 70px;
}

.pf__toggle {
  width: 18px;
  height: 18px;
  accent-color: var(--pf-accent);
  cursor: pointer;
}

.pf__hint {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.72rem;
  color: var(--pf-text-muted);
}

/* Input group */
.pf__input-group {
  display: flex;
  gap: 0.35rem;
}

.pf__input-group-select {
  max-width: 130px;
  flex-shrink: 0;
}

.pf__input-group-main {
  flex: 1;
  min-width: 0;
}

.pf__input-group-sep {
  display: flex;
  align-items: center;
  padding: 0 0.4rem;
  font-size: 0.875rem;
  color: var(--pf-text-muted);
  background: #f8fafc;
  border: 1px solid var(--pf-border);
  border-radius: 7px;
}

/* Checkboxes */
.pf__checkboxes {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.pf__checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  cursor: pointer;
}

.pf__checkbox {
  accent-color: var(--pf-accent);
  width: 15px;
  height: 15px;
  cursor: pointer;
}

/* Image preview btn */
.pf__img-preview-btn {
  padding: 0.45rem 0.7rem;
  border: 1px solid var(--pf-border);
  border-radius: 7px;
  background: #f8fafc;
  color: var(--pf-text-muted);
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.15s;
  flex-shrink: 0;
  align-self: flex-start;
}

.pf__img-preview-btn:hover {
  background: #eef2ff;
  color: var(--pf-accent);
}

/* Subsection label */
.pf__subsection {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--pf-accent);
  margin: 1rem 0 0.6rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid var(--pf-border);
}

/* ── Mensajes ── */
.pf__message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.pf__message--success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.pf__message--error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.pf__message-close {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.6;
  font-size: 0.85rem;
  padding: 0;
}

.pf__message-close:hover {
  opacity: 1;
}

/* ── Botones ── */
.pf__actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.5rem;
  padding-bottom: 1.5rem;
}

.pf__submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.65rem 1rem;
  border-radius: 9px;
  background: var(--pf-accent);
  color: white;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.pf__submit-btn:hover:not(:disabled) {
  background: #2d4fd4;
}
.pf__submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pf__cancel-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1rem;
  border-radius: 9px;
  background: transparent;
  color: var(--pf-text-muted);
  border: 1px solid var(--pf-border);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.pf__cancel-btn:hover:not(:disabled) {
  background: #f8fafc;
  color: var(--pf-text);
}

.pf__cancel-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pf__loading-text {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.pf__spinner-sm {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Modal imagen ── */
.pf-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1060;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.pf-modal {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  max-width: 480px;
  width: 100%;
}

.pf-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--pf-border);
}

.pf-modal__header h5 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.pf-modal__header .pf__close {
  color: var(--pf-text-muted);
}
.pf-modal__header .pf__close:hover {
  color: var(--pf-text);
}

.pf-modal__body {
  padding: 1.25rem;
  text-align: center;
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .pf {
    --pf-width: 100vw;
  }
}
</style>
