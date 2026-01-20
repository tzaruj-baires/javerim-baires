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
          <!-- 1. Información Personal -->
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#formPersonal"
              >
                <i class="bi bi-person me-2"></i> Información personal
                <span v-if="!canEditSection('personal')" class="badge bg-secondary ms-auto"
                  >Solo lectura</span
                >
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
                  <label for="cuil" class="form-label">CUIL</label>
                  <input
                    v-model="formData.CUIL"
                    type="text"
                    class="form-control"
                    id="cuil"
                    placeholder="Ej: 20-12345678-9"
                    :disabled="isLoading || !canEditSection('personal')"
                  />
                </div>

                <div class="mb-3">
                  <label for="nombre" class="form-label">Nombre</label>
                  <input
                    v-model="formData.nombre"
                    type="text"
                    class="form-control"
                    id="nombre"
                    placeholder="Ingrese nombre"
                    :disabled="isLoading || !canEditSection('personal')"
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
                    :disabled="isLoading || !canEditSection('personal')"
                  />
                </div>

                <div class="mb-3">
                  <label for="nacimiento" class="form-label">Nacimiento</label>
                  <input
                    v-model="formData.nacimiento"
                    type="date"
                    class="form-control"
                    id="nacimiento"
                    :disabled="isLoading || !canEditSection('personal')"
                  />
                </div>

                <div class="mb-3">
                  <label for="genero" class="form-label">Género</label>
                  <select
                    v-model="formData.genero"
                    class="form-select"
                    id="genero"
                    :disabled="isLoading || !canEditSection('personal')"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Contacto -->
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#formContacto"
              >
                <i class="bi bi-telephone me-2"></i> Contacto
                <span v-if="!canEditSection('contacto')" class="badge bg-secondary ms-auto"
                  >Solo lectura</span
                >
              </button>
            </h2>
            <div
              id="formContacto"
              class="accordion-collapse collapse"
              data-bs-parent="#formAccordion"
            >
              <div class="accordion-body">
                <div class="mb-3">
                  <label for="celular" class="form-label">Celular</label>
                  <input
                    v-model="formData.celular"
                    type="text"
                    class="form-control"
                    id="celular"
                    placeholder="Ingrese celular"
                    :disabled="isLoading || !canEditSection('contacto')"
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
                    :disabled="isLoading || !canEditSection('contacto')"
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
                    :disabled="isLoading || !canEditSection('contacto')"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Domicilio -->
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#formDomicilio"
              >
                <i class="bi bi-houses me-2"></i> Domicilio
                <span v-if="!canEditSection('domicilio')" class="badge bg-secondary ms-auto"
                  >Solo lectura</span
                >
              </button>
            </h2>
            <div
              id="formDomicilio"
              class="accordion-collapse collapse"
              data-bs-parent="#formAccordion"
            >
              <div class="accordion-body">
                <div class="mb-3">
                  <label for="direccion1" class="form-label">Dirección 1</label>
                  <input
                    v-model="formData.direccion1"
                    type="text"
                    class="form-control"
                    id="direccion1"
                    placeholder="Ingrese dirección"
                    :disabled="isLoading || !canEditSection('domicilio')"
                  />
                </div>
                <div class="mb-3">
                  <label for="barrio1" class="form-label">Barrio 1</label>
                  <input
                    v-model="formData.barrio1"
                    type="text"
                    class="form-control"
                    id="barrio1"
                    placeholder="Ingrese barrio"
                    :disabled="isLoading || !canEditSection('domicilio')"
                  />
                </div>

                <div class="mb-3">
                  <label for="direccion2" class="form-label">Dirección 2</label>
                  <input
                    v-model="formData.direccion2"
                    type="text"
                    class="form-control"
                    id="direccion2"
                    placeholder="Ingrese dirección"
                    :disabled="isLoading || !canEditSection('domicilio')"
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
                    :disabled="isLoading || !canEditSection('domicilio')"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 4. Médicos -->
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#formMedicos"
              >
                <i class="bi bi-heart-pulse me-2"></i> Médicos
                <span v-if="!canEditSection('medicos')" class="badge bg-secondary ms-auto"
                  >Solo lectura</span
                >
              </button>
            </h2>
            <div
              id="formMedicos"
              class="accordion-collapse collapse"
              data-bs-parent="#formAccordion"
            >
              <div class="accordion-body">
                <div class="mb-3">
                  <label for="obraSocial" class="form-label">Obra Social</label>
                  <input
                    v-model="formData.obraSocial"
                    type="text"
                    class="form-control"
                    id="obraSocial"
                    placeholder="Ingrese obra social"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="obraSocial_Plan" class="form-label">Plan Obra Social</label>
                  <input
                    v-model="formData.obraSocial_Plan"
                    type="text"
                    class="form-control"
                    id="obraSocial_Plan"
                    placeholder="Ingrese plan"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="obraSocial_id" class="form-label">ID Obra Social</label>
                  <input
                    v-model="formData.obraSocial_id"
                    type="text"
                    class="form-control"
                    id="obraSocial_id"
                    placeholder="Ingrese ID"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="obraSocial_Carnet" class="form-label">Carnet Obra Social</label>
                  <input
                    v-model="formData.obraSocial_Carnet"
                    type="text"
                    class="form-control"
                    id="obraSocial_Carnet"
                    placeholder="Ingrese carnet"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="med_dieta" class="form-label">Dieta</label>
                  <input
                    v-model="formData.med_dieta"
                    type="text"
                    class="form-control"
                    id="med_dieta"
                    placeholder="Ingrese restricciones dietarias"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="med_sangre" class="form-label">Tipo de Sangre</label>
                  <input
                    v-model="formData.med_sangre"
                    type="text"
                    class="form-control"
                    id="med_sangre"
                    placeholder="Ej: O+, A-, etc"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="med_historia" class="form-label">Historia Médica</label>
                  <input
                    v-model="formData.med_historia"
                    type="text"
                    class="form-control"
                    id="med_historia"
                    placeholder="Ingrese antecedentes médicos"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="med_problemas" class="form-label">Problemas de Salud</label>
                  <input
                    v-model="formData.med_problemas"
                    type="text"
                    class="form-control"
                    id="med_problemas"
                    placeholder="Ingrese problemas actuales"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="med_act" class="form-label">Actividad Física</label>
                  <input
                    v-model="formData.med_act"
                    type="text"
                    class="form-control"
                    id="med_act"
                    placeholder="Ingrese actividades realizadas"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="med_actLesion" class="form-label">Lesiones Actuales</label>
                  <input
                    v-model="formData.med_actLesion"
                    type="text"
                    class="form-control"
                    id="med_actLesion"
                    placeholder="Ingrese lesiones"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="foto_dni" class="form-label">Foto DNI</label>
                  <input
                    v-model="formData.foto_dni"
                    type="text"
                    class="form-control"
                    id="foto_dni"
                    placeholder="Ruta o URL de foto"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="foto_rostro" class="form-label">Foto Rostro</label>
                  <input
                    v-model="formData.foto_rostro"
                    type="text"
                    class="form-control"
                    id="foto_rostro"
                    placeholder="Ruta o URL de foto"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="med_estudios" class="form-label">Estudios Realizados</label>
                  <input
                    v-model="formData.med_estudios"
                    type="text"
                    class="form-control"
                    id="med_estudios"
                    placeholder="Ingrese estudios"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="med_estudios_lab" class="form-label">Estudios Laboratorio</label>
                  <input
                    v-model="formData.med_estudios_lab"
                    type="text"
                    class="form-control"
                    id="med_estudios_lab"
                    placeholder="Ingrese análisis"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="med_estudios_ergo" class="form-label">Estudios Ergonómico</label>
                  <input
                    v-model="formData.med_estudios_ergo"
                    type="text"
                    class="form-control"
                    id="med_estudios_ergo"
                    placeholder="Ingrese ergonomía"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="med_estudios_ecodoppler" class="form-label">Ecodoppler</label>
                  <input
                    v-model="formData.med_estudios_ecodoppler"
                    type="text"
                    class="form-control"
                    id="med_estudios_ecodoppler"
                    placeholder="Ingrese resultado"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="med_estudios_rx" class="form-label">Radiografías</label>
                  <input
                    v-model="formData.med_estudios_rx"
                    type="text"
                    class="form-control"
                    id="med_estudios_rx"
                    placeholder="Ingrese resultado"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="med_estudios_extras" class="form-label">Otros Estudios</label>
                  <input
                    v-model="formData.med_estudios_extras"
                    type="text"
                    class="form-control"
                    id="med_estudios_extras"
                    placeholder="Ingrese otros"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="med_estudios_extraMotivo" class="form-label"
                    >Motivo Otros Estudios</label
                  >
                  <input
                    v-model="formData.med_estudios_extraMotivo"
                    type="text"
                    class="form-control"
                    id="med_estudios_extraMotivo"
                    placeholder="Ingrese motivo"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="med_estudios_certificado" class="form-label">Certificado</label>
                  <input
                    v-model="formData.med_estudios_certificado"
                    type="text"
                    class="form-control"
                    id="med_estudios_certificado"
                    placeholder="Ingrese certificado"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="med_estudios_fechaEst" class="form-label">Fecha Estudio</label>
                  <input
                    v-model="formData.med_estudios_fechaEst"
                    type="date"
                    class="form-control"
                    id="med_estudios_fechaEst"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="med_aclararimg" class="form-label">Aclaraciones Imágenes</label>
                  <input
                    v-model="formData.med_aclararimg"
                    type="text"
                    class="form-control"
                    id="med_aclararimg"
                    placeholder="Ingrese aclaraciones"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="med_estudios_img1" class="form-label">Imagen 1</label>
                  <input
                    v-model="formData.med_estudios_img1"
                    type="text"
                    class="form-control"
                    id="med_estudios_img1"
                    placeholder="Ruta o URL"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="med_estudios_img2" class="form-label">Imagen 2</label>
                  <input
                    v-model="formData.med_estudios_img2"
                    type="text"
                    class="form-control"
                    id="med_estudios_img2"
                    placeholder="Ruta o URL"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="med_estudios_img3" class="form-label">Imagen 3</label>
                  <input
                    v-model="formData.med_estudios_img3"
                    type="text"
                    class="form-control"
                    id="med_estudios_img3"
                    placeholder="Ruta o URL"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>

                <div class="mb-3">
                  <label for="med_estudios_otro" class="form-label">Otro</label>
                  <input
                    v-model="formData.med_estudios_otro"
                    type="text"
                    class="form-control"
                    id="med_estudios_otro"
                    placeholder="Ingrese otros datos"
                    :disabled="isLoading || !canEditSection('medicos')"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 5. Organización -->
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#formOrganizacion"
              >
                <i class="bi bi-building me-2"></i> Organización
                <span v-if="!canEditSection('organizacion')" class="badge bg-secondary ms-auto"
                  >Solo lectura</span
                >
              </button>
            </h2>
            <div
              id="formOrganizacion"
              class="accordion-collapse collapse"
              data-bs-parent="#formAccordion"
            >
              <div class="accordion-body">
                <div class="mb-3">
                  <label for="organizacion" class="form-label">Organización</label>
                  <input
                    v-model="formData.organizacion"
                    type="text"
                    class="form-control"
                    id="organizacion"
                    placeholder="Ingrese organización"
                    :disabled="isLoading || !canEditSection('organizacion')"
                  />
                </div>

                <div class="mb-3">
                  <label for="areas" class="form-label">Áreas</label>
                  <input
                    v-model="formData.areas"
                    type="text"
                    class="form-control"
                    id="areas"
                    placeholder="Ingrese áreas"
                    :disabled="isLoading || !canEditSection('organizacion')"
                  />
                </div>

                <div class="mb-3">
                  <label for="apodoCBok" class="form-label">Apodo CBok</label>
                  <input
                    v-model="formData.apodoCBok"
                    type="text"
                    class="form-control"
                    id="apodoCBok"
                    placeholder="Ingrese apodo"
                    :disabled="isLoading || !canEditSection('organizacion')"
                  />
                </div>

                <div class="mb-3">
                  <label for="activo" class="form-label me-2">¿Activo?</label>
                  <input
                    v-model="formData.activo"
                    type="checkbox"
                    class="form-check-input"
                    id="activo"
                    :disabled="isLoading || !canEditSection('organizacion')"
                  />
                </div>

                <div class="mb-3">
                  <label for="nivel" class="form-label">Nivel</label>
                  <input
                    v-model="formData.nivel"
                    type="text"
                    class="form-control"
                    id="nivel"
                    placeholder="Ingrese nivel"
                    :disabled="isLoading || !canEditSection('organizacion')"
                  />
                </div>

                <div class="mb-3">
                  <label for="nivelHBTJ" class="form-label">Nivel HBTJ</label>
                  <input
                    v-model="formData.nivelHBTJ"
                    type="text"
                    class="form-control"
                    id="nivelHBTJ"
                    placeholder="Ingrese nivel HBTJ"
                    :disabled="isLoading || !canEditSection('organizacion')"
                  />
                </div>

                <div class="mb-3">
                  <label for="fecha_ingresoOrg" class="form-label">Fecha de Ingreso a Org</label>
                  <input
                    v-model="formData.fecha_ingresoOrg"
                    type="date"
                    class="form-control"
                    id="fecha_ingresoOrg"
                    :disabled="isLoading || !canEditSection('organizacion')"
                  />
                </div>

                <div class="mb-3">
                  <label for="fecha_ingresoMilu" class="form-label">Fecha de Ingreso a Milu</label>
                  <input
                    v-model="formData.fecha_ingresoMilu"
                    type="date"
                    class="form-control"
                    id="fecha_ingresoMilu"
                    :disabled="isLoading || !canEditSection('organizacion')"
                  />
                </div>

                <div class="mb-3">
                  <label for="areas_historicas" class="form-label">Áreas Históricas</label>
                  <input
                    v-model="formData.areas_historicas"
                    type="text"
                    class="form-control"
                    id="areas_historicas"
                    placeholder="Ingrese áreas históricas"
                    :disabled="isLoading || !canEditSection('organizacion')"
                  />
                </div>

                <div class="mb-3">
                  <label for="curso_TL" class="form-label">Curso TL</label>
                  <input
                    v-model="formData.curso_TL"
                    type="text"
                    class="form-control"
                    id="curso_TL"
                    placeholder="Ingrese datos del curso"
                    :disabled="isLoading || !canEditSection('organizacion')"
                  />
                </div>

                <div class="mb-3">
                  <label for="curso_AvH" class="form-label">Curso Av H</label>
                  <input
                    v-model="formData.curso_AvH"
                    type="text"
                    class="form-control"
                    id="curso_AvH"
                    placeholder="Ingrese datos del curso"
                    :disabled="isLoading || !canEditSection('organizacion')"
                  />
                </div>

                <div class="mb-3">
                  <label for="curso_AvKM" class="form-label">Curso Av KM</label>
                  <input
                    v-model="formData.curso_AvKM"
                    type="text"
                    class="form-control"
                    id="curso_AvKM"
                    placeholder="Ingrese datos del curso"
                    :disabled="isLoading || !canEditSection('organizacion')"
                  />
                </div>

                <div class="mb-3">
                  <label for="curso_IE" class="form-label">Curso IE</label>
                  <input
                    v-model="formData.curso_IE"
                    type="text"
                    class="form-control"
                    id="curso_IE"
                    placeholder="Ingrese datos del curso"
                    :disabled="isLoading || !canEditSection('organizacion')"
                  />
                </div>

                <div class="mb-3">
                  <label for="curso_FND" class="form-label">Curso FND</label>
                  <input
                    v-model="formData.curso_FND"
                    type="text"
                    class="form-control"
                    id="curso_FND"
                    placeholder="Ingrese datos del curso"
                    :disabled="isLoading || !canEditSection('organizacion')"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 6. Vida y Desarrollo -->
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#formDesarrollo"
              >
                <i class="bi bi-book me-2"></i> Vida y Desarrollo
                <span v-if="!canEditSection('desarrollo')" class="badge bg-secondary ms-auto"
                  >Solo lectura</span
                >
              </button>
            </h2>
            <div
              id="formDesarrollo"
              class="accordion-collapse collapse"
              data-bs-parent="#formAccordion"
            >
              <div class="accordion-body">
                <p class="text-muted">
                  <small
                    >Esta sección puede ampliarse con campos adicionales según sea necesario</small
                  >
                </p>
              </div>
            </div>
          </div>

          <!-- 7. Familia -->
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#formFamilia"
              >
                <i class="bi bi-people me-2"></i> Familia
                <span v-if="!canEditSection('familia')" class="badge bg-secondary ms-auto"
                  >Solo lectura</span
                >
              </button>
            </h2>
            <div
              id="formFamilia"
              class="accordion-collapse collapse"
              data-bs-parent="#formAccordion"
            >
              <div class="accordion-body">
                <p class="text-muted">
                  <small
                    >Esta sección puede ampliarse con campos adicionales según sea necesario</small
                  >
                </p>
              </div>
            </div>
          </div>

          <!-- 8. Técnicos -->
          <div v-if="canSeeTechnical" class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#formTecnicos"
              >
                <i class="bi bi-gear me-2"></i> Técnicos
                <span v-if="!canEditSection('tecnicos')" class="badge bg-secondary ms-auto"
                  >Solo lectura</span
                >
              </button>
            </h2>
            <div
              id="formTecnicos"
              class="accordion-collapse collapse"
              data-bs-parent="#formAccordion"
            >
              <div class="accordion-body">
                <p class="text-muted">
                  <small
                    >Esta sección puede ampliarse con campos adicionales según sea necesario</small
                  >
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones -->
        <div class="d-grid gap-2 mt-4">
          <button type="submit" class="btn btn-primary" :disabled="isLoading || !canEditAny">
            <span v-if="!isLoading"><i class="bi bi-check-circle me-2"></i>Actualizar Datos</span>
            <span v-else>
              <span class="spinner-border spinner-border-sm me-2"></span>Guardando...
            </span>
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="close"
            :disabled="isLoading || !canEditAny"
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
const offcanvasId = computed(() => `profileForm-${Math.random().toString(36).substr(2, 9)}`)

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
  // Información Personal
  DNI: null,
  dni: null,
  CUIL: '',
  nombre: '',
  apellido: '',
  nacimiento: '',
  genero: '',
  // Contacto
  celular: '',
  mail_personal: '',
  mail_operativo: '',
  // Domicilio
  direccion1: '',
  barrio1: '',
  direccion2: '',
  barrio2: '',
  // Médicos
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
  med_estudios_lab: '',
  med_estudios_ergo: '',
  med_estudios_ecodoppler: '',
  med_estudios_rx: '',
  med_estudios_extras: '',
  med_estudios_extraMotivo: '',
  med_estudios_certificado: '',
  med_estudios_fechaEst: '',
  med_aclararimg: '',
  med_estudios_img1: '',
  med_estudios_img2: '',
  med_estudios_img3: '',
  med_estudios_otro: '',
  // Organización
  organizacion: '',
  areas: '',
  apodoCBok: '',
  activo: false,
  nivel: '',
  nivelHBTJ: '',
  fecha_ingresoOrg: '',
  fecha_ingresoMilu: '',
  areas_historicas: '',
  curso_TL: '',
  curso_AvH: '',
  curso_AvKM: '',
  curso_IE: '',
  curso_FND: '',
})

// Watchers
watch(
  () => props.profileData,
  (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      formData.value = {
        // Información Personal
        DNI: newData.DNI || newData.dni,
        dni: newData.dni || newData.DNI,
        CUIL: newData.CUIL || '',
        nombre: newData.nombre || '',
        apellido: newData.apellido || '',
        nacimiento: newData.nacimiento || '',
        genero: newData.genero || '',
        // Contacto
        celular: newData.celular || newData.cellphone || '',
        mail_personal: newData.mail_personal || '',
        mail_operativo: newData.mail_operativo || '',
        // Domicilio
        direccion1: newData.direccion1 || '',
        barrio1: newData.barrio1 || '',
        direccion2: newData.direccion2 || '',
        barrio2: newData.barrio2 || '',
        // Médicos
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
        med_estudios_lab: newData.med_estudios_lab || '',
        med_estudios_ergo: newData.med_estudios_ergo || '',
        med_estudios_ecodoppler: newData.med_estudios_ecodoppler || '',
        med_estudios_rx: newData.med_estudios_rx || '',
        med_estudios_extras: newData.med_estudios_extras || '',
        med_estudios_extraMotivo: newData.med_estudios_extraMotivo || '',
        med_estudios_certificado: newData.med_estudios_certificado || '',
        med_estudios_fechaEst: newData.med_estudios_fechaEst || '',
        med_aclararimg: newData.med_aclararimg || '',
        med_estudios_img1: newData.med_estudios_img1 || '',
        med_estudios_img2: newData.med_estudios_img2 || '',
        med_estudios_img3: newData.med_estudios_img3 || '',
        med_estudios_otro: newData.med_estudios_otro || '',
        // Organización
        organizacion: newData.organizacion || '',
        areas: newData.areas || '',
        apodoCBok: newData.apodoCBok || '',
        activo: newData.activo || false,
        nivel: newData.nivel || '',
        nivelHBTJ: newData.nivelHBTJ || '',
        fecha_ingresoOrg: newData.fecha_ingresoOrg || '',
        fecha_ingresoMilu: newData.fecha_ingresoMilu || '',
        areas_historicas: newData.areas_historicas || '',
        curso_TL: newData.curso_TL || '',
        curso_AvH: newData.curso_AvH || '',
        curso_AvKM: newData.curso_AvKM || '',
        curso_IE: newData.curso_IE || '',
        curso_FND: newData.curso_FND || '',
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
      // Información Personal
      DNI: formData.value.DNI,
      CUIL: formData.value.CUIL,
      nombre: formData.value.nombre,
      apellido: formData.value.apellido,
      nacimiento: formData.value.nacimiento,
      genero: formData.value.genero,
      // Contacto
      celular: formData.value.celular,
      mail_personal: formData.value.mail_personal,
      mail_operativo: formData.value.mail_operativo,
      // Domicilio
      direccion1: formData.value.direccion1,
      barrio1: formData.value.barrio1,
      direccion2: formData.value.direccion2,
      barrio2: formData.value.barrio2,
      // Médicos
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
      med_estudios_lab: formData.value.med_estudios_lab,
      med_estudios_ergo: formData.value.med_estudios_ergo,
      med_estudios_ecodoppler: formData.value.med_estudios_ecodoppler,
      med_estudios_rx: formData.value.med_estudios_rx,
      med_estudios_extras: formData.value.med_estudios_extras,
      med_estudios_extraMotivo: formData.value.med_estudios_extraMotivo,
      med_estudios_certificado: formData.value.med_estudios_certificado,
      med_estudios_fechaEst: formData.value.med_estudios_fechaEst,
      med_aclararimg: formData.value.med_aclararimg,
      med_estudios_img1: formData.value.med_estudios_img1,
      med_estudios_img2: formData.value.med_estudios_img2,
      med_estudios_img3: formData.value.med_estudios_img3,
      med_estudios_otro: formData.value.med_estudios_otro,
      // Organización
      organizacion: formData.value.organizacion,
      areas: formData.value.areas,
      apodoCBok: formData.value.apodoCBok,
      activo: formData.value.activo,
      nivel: formData.value.nivel,
      nivelHBTJ: formData.value.nivelHBTJ,
      fecha_ingresoOrg: formData.value.fecha_ingresoOrg,
      fecha_ingresoMilu: formData.value.fecha_ingresoMilu,
      areas_historicas: formData.value.areas_historicas,
      curso_TL: formData.value.curso_TL,
      curso_AvH: formData.value.curso_AvH,
      curso_AvKM: formData.value.curso_AvKM,
      curso_IE: formData.value.curso_IE,
      curso_FND: formData.value.curso_FND,
    }

    await update('main', mainData)

    // Actualizar en users (campos limitados)
    try {
      await update('users', {
        dni: formData.value.dni,
        email: formData.value.mail_operativo || formData.value.mail_personal,
        cellphone: formData.value.celular,
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
