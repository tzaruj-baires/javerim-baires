<template>
  <div class="ud">
    <!-- ── Header ── -->
    <div class="ud__header">
      <div class="ud__header-left">
        <router-link to="/" class="ud__back-btn">
          <i class="bi bi-arrow-left"></i>
        </router-link>
        <div>
          <p class="ud__header-eyebrow">Perfil de usuario</p>
          <h1 class="ud__header-title" v-if="userData?.nombre">
            {{ userData.nombre }} {{ userData.apellido }}
          </h1>
          <h1 class="ud__header-title ud__header-title--placeholder" v-else>Cargando...</h1>
        </div>
      </div>
      <div class="ud__header-actions" v-if="!notFound && !noPermission">
        <span class="ud__readonly-badge" v-if="!canEdit && !loading">
          <i class="bi bi-eye"></i> Solo lectura
        </span>
        <button
          @click="openEditForm"
          class="ud__edit-btn"
          :disabled="loading || !canEdit"
          v-if="!loading"
        >
          <i class="bi bi-pencil-square"></i>
          <span>Editar datos</span>
        </button>
      </div>
    </div>

    <!-- ── Error: no encontrado ── -->
    <div v-if="notFound" class="ud__alert ud__alert--danger">
      <i class="bi bi-exclamation-circle"></i>
      No se encontró el usuario con DNI: <strong>{{ route.params.dni }}</strong>
    </div>

    <!-- ── Error: sin permisos ── -->
    <div v-if="noPermission" class="ud__alert ud__alert--warning">
      <i class="bi bi-shield-exclamation"></i>
      No tenés permisos para ver este usuario.
    </div>

    <!-- ── Contenido principal ── -->
    <div v-if="!notFound && !noPermission" class="ud__body">
      <!-- Columna principal -->
      <div class="ud__main">
        <!-- Loading state -->
        <div v-if="loading" class="ud__loading">
          <span class="ud__spinner"></span>
          <span>Cargando datos...</span>
        </div>

        <!-- Acordeones -->
        <div v-else-if="userData" class="ud__accordion">
          <!-- 1. Info Personal -->
          <div class="ud__acc-item">
            <button
              class="ud__acc-trigger"
              @click="toggleSection('personal')"
              :class="{ open: openSections.personal }"
            >
              <span class="ud__acc-trigger-left">
                <span class="ud__acc-icon ud__acc-icon--blue"><i class="bi bi-person"></i></span>
                Información Personal
              </span>
              <i
                class="bi bi-chevron-down ud__acc-chevron"
                :class="{ rotated: openSections.personal }"
              ></i>
            </button>
            <div class="ud__acc-body" v-show="openSections.personal">
              <div class="ud__fields">
                <div class="ud__field">
                  <span class="ud__field-label">DNI</span>
                  <span class="ud__field-value ud__field-value--mono">{{ userData.DNI }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">CUIL</span>
                  <span class="ud__field-value">{{ userData.CUIL || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Nombre</span>
                  <span class="ud__field-value">{{ userData.nombre }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Apellido</span>
                  <span class="ud__field-value">{{ userData.apellido }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Nacimiento</span>
                  <span class="ud__field-value">{{ formatFecha(userData.nacimiento) || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Género</span>
                  <span class="ud__field-value">{{ userData.genero || '—' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Contacto -->
          <div class="ud__acc-item">
            <button
              class="ud__acc-trigger"
              @click="toggleSection('contacto')"
              :class="{ open: openSections.contacto }"
            >
              <span class="ud__acc-trigger-left">
                <span class="ud__acc-icon ud__acc-icon--green"
                  ><i class="bi bi-telephone"></i
                ></span>
                Contacto
              </span>
              <i
                class="bi bi-chevron-down ud__acc-chevron"
                :class="{ rotated: openSections.contacto }"
              ></i>
            </button>
            <div class="ud__acc-body" v-show="openSections.contacto">
              <div class="ud__fields">
                <div class="ud__field">
                  <span class="ud__field-label">Celular</span>
                  <a
                    :href="`https://wa.me/${userData.celular}`"
                    class="ud__field-value ud__field-value--link"
                    v-if="userData.celular"
                    target="_blank"
                  >
                    <i class="bi bi-whatsapp"></i>
                    {{ formatPhone(userData.celular, 'INTERNATIONAL') }}
                  </a>
                  <span class="ud__field-value" v-else>—</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Email Personal</span>
                  <a
                    :href="`mailto:${userData.mail_personal}`"
                    class="ud__field-value ud__field-value--link"
                    v-if="userData.mail_personal"
                  >
                    {{ userData.mail_personal }}
                  </a>
                  <span class="ud__field-value" v-else>—</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Email Operativo</span>
                  <a
                    :href="`mailto:${userData.mail_operativo}`"
                    class="ud__field-value ud__field-value--link"
                    v-if="userData.mail_operativo"
                  >
                    {{ userData.mail_operativo }}
                  </a>
                  <span class="ud__field-value" v-else>—</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Domicilio -->
          <div class="ud__acc-item">
            <button
              class="ud__acc-trigger"
              @click="toggleSection('domicilio')"
              :class="{ open: openSections.domicilio }"
            >
              <span class="ud__acc-trigger-left">
                <span class="ud__acc-icon ud__acc-icon--orange"><i class="bi bi-houses"></i></span>
                Domicilio
              </span>
              <i
                class="bi bi-chevron-down ud__acc-chevron"
                :class="{ rotated: openSections.domicilio }"
              ></i>
            </button>
            <div class="ud__acc-body" v-show="openSections.domicilio">
              <div class="ud__fields">
                <div class="ud__field">
                  <span class="ud__field-label">Dirección 1</span>
                  <span class="ud__field-value">{{ userData.direccion1 || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Barrio 1</span>
                  <span class="ud__field-value">{{ userData.barrio1 || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Dirección 2</span>
                  <span class="ud__field-value">{{ userData.direccion2 || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Barrio 2</span>
                  <span class="ud__field-value">{{ userData.barrio2 || '—' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. Médicos -->
          <div class="ud__acc-item">
            <button
              class="ud__acc-trigger"
              @click="toggleSection('medicos')"
              :class="{ open: openSections.medicos }"
            >
              <span class="ud__acc-trigger-left">
                <span class="ud__acc-icon ud__acc-icon--red"
                  ><i class="bi bi-heart-pulse"></i
                ></span>
                Médicos
              </span>
              <i
                class="bi bi-chevron-down ud__acc-chevron"
                :class="{ rotated: openSections.medicos }"
              ></i>
            </button>
            <div class="ud__acc-body" v-show="openSections.medicos">
              <div class="ud__fields">
                <div class="ud__field">
                  <span class="ud__field-label">Foto DNI</span>
                  <span class="ud__field-value">
                    <template v-if="isValidFileLink(userData.foto_dni)">
                      <button
                        type="button"
                        class="ud__image-card"
                        @click="openPreviewModal(userData.foto_dni, 'Foto DNI')"
                      >
                        <template v-if="!imageLoadError.foto_dni">
                          <img
                            :key="userData.foto_dni"
                            :src="getDriveImageUrl(userData.foto_dni)"
                            alt="Foto DNI"
                            @error="handleImageLoadError('foto_dni')"
                          />
                        </template>
                        <template v-else>
                          <div class="ud__image-card-fallback">
                            <i class="bi bi-person-circle"></i>
                          </div>
                        </template>
                      </button>
                    </template>
                    <span v-else>—</span>
                  </span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Foto Rostro</span>
                  <span class="ud__field-value">
                    <template v-if="isValidFileLink(userData.foto_rostro)">
                      <button
                        type="button"
                        class="ud__image-card"
                        @click="openPreviewModal(userData.foto_rostro, 'Foto Rostro')"
                      >
                        <template v-if="!imageLoadError.foto_rostro">
                          <img
                            :key="userData.foto_rostro"
                            :src="getDriveImageUrl(userData.foto_rostro)"
                            alt="Foto Rostro"
                            @error="handleImageLoadError('foto_rostro')"
                          />
                        </template>
                        <template v-else>
                          <div class="ud__image-card-fallback">
                            <i class="bi bi-person-circle"></i>
                          </div>
                        </template>
                      </button>
                    </template>
                    <span v-else>—</span>
                  </span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Obra Social</span>
                  <span class="ud__field-value">{{ userData.obraSocial || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Plan</span>
                  <span class="ud__field-value">{{ userData.obraSocial_Plan || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">ID Obra Social</span>
                  <span class="ud__field-value">{{ userData.obraSocial_id || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Carnet</span>
                  <span class="ud__field-value">
                    <template v-if="isValidFileLink(userData.obraSocial_Carnet)">
                      <template v-if="isImageUrl(userData.obraSocial_Carnet)">
                        <button
                          type="button"
                          class="ud__image-card"
                          @click="
                            openPreviewModal(userData.obraSocial_Carnet, 'Carnet Obra Social')
                          "
                        >
                          <img :src="userData.obraSocial_Carnet" alt="Carnet Obra Social" />
                        </button>
                      </template>
                      <template v-else>
                        <span class="ud__file-pill-wrapper">
                          <button
                            type="button"
                            class="ud__file-pill"
                            :class="{
                              'ud__file-pill--disabled': !isValidFileLink(
                                userData.obraSocial_Carnet,
                              ),
                              'ud__file-pill--active':
                                fileActionFor && fileActionFor.url === userData.obraSocial_Carnet,
                            }"
                            :disabled="!isValidFileLink(userData.obraSocial_Carnet)"
                            @click.stop="
                              isValidFileLink(userData.obraSocial_Carnet) &&
                              toggleFileActions(userData.obraSocial_Carnet, 'Carnet Obra Social')
                            "
                          >
                            <i :class="getFileIcon(userData.obraSocial_Carnet)"></i>
                            {{ 'Carnet' }}
                          </button>
                          <div
                            v-if="fileActionFor && fileActionFor.url === userData.obraSocial_Carnet"
                            class="ud__file-actions"
                          >
                            <button
                              type="button"
                              class="ud__file-action-btn"
                              @click.stop="openFileUrl(userData.obraSocial_Carnet)"
                            >
                              Abrir archivo
                            </button>
                            <button
                              type="button"
                              class="ud__file-action-btn"
                              @click.stop="
                                openPreviewModal(userData.obraSocial_Carnet, 'Carnet Obra Social')
                              "
                            >
                              Ver previsualización
                            </button>
                          </div>
                        </span>
                      </template>
                    </template>
                    <span v-else>—</span>
                  </span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Dieta</span>
                  <span class="ud__field-value">{{ userData.med_dieta || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Tipo de Sangre</span>
                  <span class="ud__field-value">{{ userData.med_sangre || '—' }}</span>
                </div>
                <div class="ud__field ud__field--full">
                  <span class="ud__field-label">Lesiones / Operaciones / Medicación</span>
                  <span class="ud__field-value">{{ userData.med_historia || '—' }}</span>
                </div>
                <div class="ud__field ud__field--full">
                  <span class="ud__field-label">Problemas crónicos</span>
                  <span class="ud__field-value">{{ userData.med_problemas || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">¿Actividad Física?</span>
                  <span class="ud__field-value">{{ userData.med_act || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Lesiones Actuales</span>
                  <span class="ud__field-value">{{ userData.med_actLesion || '—' }}</span>
                </div>
              </div>
              <div class="ud__subsection-title">Estudios Médicos</div>
              <div class="ud__fields">
                <div class="ud__field ud__field--full">
                  <span class="ud__field-label">Estudios Realizados</span>
                  <span class="ud__field-value">{{ userData.med_estudios || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Estudios Extras</span>
                  <span class="ud__field-value">{{ userData.med_estudios_extras || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Motivo Estudio Extra</span>
                  <span class="ud__field-value">{{
                    userData.med_estudios_extraMotivo || '—'
                  }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Archivo de Estudios</span>
                  <span class="ud__field-value">
                    <template v-if="isValidFileLink(userData.med_estudios_pdf)">
                      <template v-if="isImageUrl(userData.med_estudios_pdf)">
                        <button
                          type="button"
                          class="ud__image-card"
                          @click="
                            openPreviewModal(userData.med_estudios_pdf, 'Archivo de Estudios')
                          "
                        >
                          <img :src="userData.med_estudios_pdf" alt="Archivo de Estudios" />
                        </button>
                      </template>
                      <template v-else>
                        <span class="ud__file-pill-wrapper">
                          <button
                            type="button"
                            class="ud__file-pill"
                            :class="{
                              'ud__file-pill--disabled': !isValidFileLink(
                                userData.med_estudios_pdf,
                              ),
                              'ud__file-pill--active':
                                fileActionFor && fileActionFor.url === userData.med_estudios_pdf,
                            }"
                            :disabled="!isValidFileLink(userData.med_estudios_pdf)"
                            @click.stop="
                              isValidFileLink(userData.med_estudios_pdf) &&
                              toggleFileActions(userData.med_estudios_pdf, 'Archivo de Estudios')
                            "
                          >
                            <i :class="getFileIcon(userData.med_estudios_pdf)"></i>
                            {{ 'Estudios Médicos' }}
                          </button>
                          <div
                            v-if="fileActionFor && fileActionFor.url === userData.med_estudios_pdf"
                            class="ud__file-actions"
                          >
                            <button
                              type="button"
                              class="ud__file-action-btn"
                              @click.stop="openFileUrl(userData.med_estudios_pdf)"
                            >
                              Abrir archivo
                            </button>
                            <button
                              type="button"
                              class="ud__file-action-btn"
                              @click.stop="
                                openPreviewModal(userData.med_estudios_pdf, 'Archivo de Estudios')
                              "
                            >
                              Ver previsualización
                            </button>
                          </div>
                        </span>
                      </template>
                    </template>
                    <span v-else>—</span>
                  </span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Certificado</span>
                  <span class="ud__field-value">
                    <template v-if="isValidFileLink(userData.med_estudios_certificado)">
                      <template v-if="isImageUrl(userData.med_estudios_certificado)">
                        <button
                          type="button"
                          class="ud__image-card"
                          @click="
                            openPreviewModal(userData.med_estudios_certificado, 'Certificado')
                          "
                        >
                          <img :src="userData.med_estudios_certificado" alt="Certificado" />
                        </button>
                      </template>
                      <template v-else>
                        <span class="ud__file-pill-wrapper">
                          <button
                            type="button"
                            class="ud__file-pill"
                            :class="{
                              'ud__file-pill--disabled': !isValidFileLink(
                                userData.med_estudios_certificado,
                              ),
                              'ud__file-pill--active':
                                fileActionFor &&
                                fileActionFor.url === userData.med_estudios_certificado,
                            }"
                            :disabled="!isValidFileLink(userData.med_estudios_certificado)"
                            @click.stop="
                              isValidFileLink(userData.med_estudios_certificado) &&
                              toggleFileActions(userData.med_estudios_certificado, 'Certificado')
                            "
                          >
                            <i :class="getFileIcon(userData.med_estudios_certificado)"></i>
                            {{ 'Certificado' }}
                          </button>
                          <div
                            v-if="
                              fileActionFor &&
                              fileActionFor.url === userData.med_estudios_certificado
                            "
                            class="ud__file-actions"
                          >
                            <button
                              type="button"
                              class="ud__file-action-btn"
                              @click.stop="openFileUrl(userData.med_estudios_certificado)"
                            >
                              Abrir archivo
                            </button>
                            <button
                              type="button"
                              class="ud__file-action-btn"
                              @click.stop="
                                openPreviewModal(userData.med_estudios_certificado, 'Certificado')
                              "
                            >
                              Ver previsualización
                            </button>
                          </div>
                        </span>
                      </template>
                    </template>
                    <span v-else>—</span>
                  </span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Fecha Certificado</span>
                  <span class="ud__field-value">{{
                    formatFecha(userData.med_estudios_fecha) || '—'
                  }}</span>
                </div>
                <div class="ud__field ud__field--full">
                  <span class="ud__field-label">Historia Clínica</span>
                  <span class="ud__field-value">{{ userData.med_estudios_img || '—' }}</span>
                </div>
                <div class="ud__field ud__field--full">
                  <span class="ud__field-label">Comentarios</span>
                  <span class="ud__field-value">{{ userData.med_estudios_otro || '—' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 5. Organización -->
          <div class="ud__acc-item">
            <button
              class="ud__acc-trigger"
              @click="toggleSection('organizacion')"
              :class="{ open: openSections.organizacion }"
            >
              <span class="ud__acc-trigger-left">
                <span class="ud__acc-icon ud__acc-icon--purple"
                  ><i class="bi bi-building"></i
                ></span>
                Organización
              </span>
              <i
                class="bi bi-chevron-down ud__acc-chevron"
                :class="{ rotated: openSections.organizacion }"
              ></i>
            </button>
            <div class="ud__acc-body" v-show="openSections.organizacion">
              <div class="ud__subsection-title">Datos Básicos</div>
              <div class="ud__fields">
                <div class="ud__field">
                  <span class="ud__field-label">Organización</span>
                  <span class="ud__field-value">{{ userData.organizacion || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Áreas</span>
                  <span class="ud__field-value">{{ userData.areas || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Apodo</span>
                  <span class="ud__field-value">{{ userData.apodo || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">¿Activo?</span>
                  <span class="ud__field-value">
                    <span
                      class="ud__status-badge"
                      :class="userData.activo === 1 ? 'active' : 'inactive'"
                    >
                      {{ userData.activo === 1 ? 'Sí' : 'No' }}
                    </span>
                  </span>
                </div>
              </div>
              <div class="ud__subsection-title">Historia en la Organización</div>
              <div class="ud__fields">
                <div class="ud__field">
                  <span class="ud__field-label">Nivel</span>
                  <span class="ud__field-value">{{ userData.nivel || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Nivel HBTJ</span>
                  <span class="ud__field-value">{{ userData.nivelHBTJ || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Ingreso Org</span>
                  <span class="ud__field-value">{{
                    formatFecha(userData.fecha_ingresoOrg) || '—'
                  }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Ingreso Milu</span>
                  <span class="ud__field-value">{{
                    formatFecha(userData.fecha_ingresoMilu) || '—'
                  }}</span>
                </div>
                <div class="ud__field ud__field--full">
                  <span class="ud__field-label">Áreas Históricas</span>
                  <span class="ud__field-value">{{ userData.areas_historicas || '—' }}</span>
                </div>
              </div>
              <div class="ud__subsection-title">Cursos Realizados</div>
              <div class="ud__fields">
                <div class="ud__field">
                  <span class="ud__field-label">Curso Básico</span>
                  <span class="ud__field-value">{{ userData.curso_CB || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Team Leader</span>
                  <span class="ud__field-value">{{ userData.curso_TL || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Avanzado H</span>
                  <span class="ud__field-value">{{ userData.curso_AvH || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Avanzado KM</span>
                  <span class="ud__field-value">{{ userData.curso_AvKM || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Curso IE</span>
                  <span class="ud__field-value">{{ userData.curso_IE || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Curso FND</span>
                  <span class="ud__field-value">{{ userData.curso_FND || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Curso IE-Ins</span>
                  <span class="ud__field-value">{{ userData.curso_IEIns || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Curso CR</span>
                  <span class="ud__field-value">{{ userData.curso_CR || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Curso CARE</span>
                  <span class="ud__field-value">{{ userData.curso_CARE || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Duración Cursos</span>
                  <span class="ud__field-value">{{ userData.cursos_tiempo || '—' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 6. Vida y Desarrollo -->
          <div class="ud__acc-item">
            <button
              class="ud__acc-trigger"
              @click="toggleSection('desarrollo')"
              :class="{ open: openSections.desarrollo }"
            >
              <span class="ud__acc-trigger-left">
                <span class="ud__acc-icon ud__acc-icon--teal"><i class="bi bi-book"></i></span>
                Vida y Desarrollo
              </span>
              <i
                class="bi bi-chevron-down ud__acc-chevron"
                :class="{ rotated: openSections.desarrollo }"
              ></i>
            </button>
            <div class="ud__acc-body" v-show="openSections.desarrollo">
              <div class="ud__subsection-title">Estudios</div>
              <div class="ud__fields">
                <div class="ud__field">
                  <span class="ud__field-label">Grado Alcanzado</span>
                  <span class="ud__field-value">{{ userData.estudios_grado || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Área de Estudios</span>
                  <span class="ud__field-value">{{ userData.estudios_area || '—' }}</span>
                </div>
                <div class="ud__field ud__field--full">
                  <span class="ud__field-label">Carrera</span>
                  <span class="ud__field-value">{{ userData.estudios_carrera || '—' }}</span>
                </div>
              </div>
              <div class="ud__subsection-title">Trabajo</div>
              <div class="ud__fields">
                <div class="ud__field">
                  <span class="ud__field-label">Área de Trabajo</span>
                  <span class="ud__field-value">{{ userData.trabajo_area || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Puesto</span>
                  <span class="ud__field-value">{{ userData.trabajo_puesto || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Barrio donde Trabaja</span>
                  <span class="ud__field-value">{{ userData.trabajo_barrio || '—' }}</span>
                </div>
              </div>
              <div class="ud__subsection-title">Comunidad</div>
              <div class="ud__fields">
                <div class="ud__field ud__field--full">
                  <span class="ud__field-label">Rol Comunitario</span>
                  <span class="ud__field-value">{{ userData.comunidad_rol || '—' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 7. Familia -->
          <div class="ud__acc-item">
            <button
              class="ud__acc-trigger"
              @click="toggleSection('familia')"
              :class="{ open: openSections.familia }"
            >
              <span class="ud__acc-trigger-left">
                <span class="ud__acc-icon ud__acc-icon--amber"><i class="bi bi-people"></i></span>
                Familia
              </span>
              <i
                class="bi bi-chevron-down ud__acc-chevron"
                :class="{ rotated: openSections.familia }"
              ></i>
            </button>
            <div class="ud__acc-body" v-show="openSections.familia">
              <div class="ud__subsection-title">Familiar 1</div>
              <div class="ud__fields">
                <div class="ud__field">
                  <span class="ud__field-label">Nombre</span>
                  <span class="ud__field-value">{{ userData.fam1_nombre || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Apellido</span>
                  <span class="ud__field-value">{{ userData.fam1_apellido || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Vínculo</span>
                  <span class="ud__field-value">{{ userData.fam1_vinculo || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Celular</span>
                  <span class="ud__field-value">{{
                    formatPhone(userData.fam1_celular, 'INTERNATIONAL') || '—'
                  }}</span>
                </div>
                <div class="ud__field ud__field--full">
                  <span class="ud__field-label">Dirección</span>
                  <span class="ud__field-value">{{ userData.fam1_direccion || '—' }}</span>
                </div>
              </div>
              <div class="ud__subsection-title">Familiar 2</div>
              <div class="ud__fields">
                <div class="ud__field">
                  <span class="ud__field-label">Nombre</span>
                  <span class="ud__field-value">{{ userData.fam2_nombre || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Apellido</span>
                  <span class="ud__field-value">{{ userData.fam2_apellido || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Vínculo</span>
                  <span class="ud__field-value">{{ userData.fam2_vinculo || '—' }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Celular</span>
                  <span class="ud__field-value">{{
                    formatPhone(userData.fam2_celular, 'INTERNATIONAL') || '—'
                  }}</span>
                </div>
                <div class="ud__field ud__field--full">
                  <span class="ud__field-label">Dirección</span>
                  <span class="ud__field-value">{{ userData.fam2_direccion || '—' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 8. Técnicos (solo nivel 3) -->
          <div class="ud__acc-item" v-if="canEditSection('tecnicos')">
            <button
              class="ud__acc-trigger"
              @click="toggleSection('tecnicos')"
              :class="{ open: openSections.tecnicos }"
            >
              <span class="ud__acc-trigger-left">
                <span class="ud__acc-icon ud__acc-icon--gray"><i class="bi bi-gear"></i></span>
                Técnicos
              </span>
              <i
                class="bi bi-chevron-down ud__acc-chevron"
                :class="{ rotated: openSections.tecnicos }"
              ></i>
            </button>
            <div class="ud__acc-body" v-show="openSections.tecnicos">
              <div class="ud__fields">
                <div class="ud__field">
                  <span class="ud__field-label">ID JVR</span>
                  <span class="ud__field-value ud__field-value--mono">{{
                    userData.ID_JVR || '—'
                  }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Telegram ID</span>
                  <span class="ud__field-value ud__field-value--mono">{{
                    userData.telegram_id || '—'
                  }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Última Modificación</span>
                  <span class="ud__field-value">{{
                    formatFechaEntera(userData.fecha_ult) || '—'
                  }}</span>
                </div>
                <div class="ud__field">
                  <span class="ud__field-label">Nivel IT</span>
                  <span class="ud__field-value">
                    <span :class="getLevelBadgeClass(userData.it_level)" class="ud__it-badge">
                      {{ getLevelName(userData.it_level) }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="ud__sidebar">
        <div class="ud__info-card">
          <div class="ud__info-card-header">
            <i class="bi bi-shield-check"></i> ¿Necesitás ayuda?
          </div>
          <div class="ud__info-card-body">
            <p>Podés solicitar ayuda técnica comunicándote con el equipo de IT.</p>
            <a
              href="https://wa.me/5491158021867/?text=Hola!%20Necesitaba%20ayuda%20con%20la%20App%20de%20Javerim%20Baires"
              class="ud__info-link"
              target="_blank"
            >
              <i class="bi bi-whatsapp"></i> Tzaruj · 11 5802-1867
            </a>
          </div>
        </div>

        <!-- Botón editar en sidebar (visible en desktop) -->
        <button
          v-if="!loading && canEdit"
          @click="openEditForm"
          class="ud__sidebar-edit-btn"
          :disabled="loading"
        >
          <i class="bi bi-pencil-square"></i> Editar datos
        </button>
      </div>
    </div>

    <div v-if="previewModal.open" class="jv-modal-backdrop" @click.self="closePreviewModal">
      <div class="jv-modal jv-modal--lg">
        <div class="jv-modal__header">
          <h3 class="jv-modal__title">{{ previewModal.title }}</h3>
          <button class="jv-modal__close" @click="closePreviewModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="jv-modal__body">
          <template v-if="previewModal.isImage">
            <img class="ud__preview-image" :src="previewModal.url" :alt="previewModal.title" />
          </template>
          <template v-else-if="previewModal.embed">
            <iframe
              class="ud__preview-frame"
              :src="previewModal.url"
              :title="previewModal.title"
            ></iframe>
          </template>
          <template v-else>
            <div class="ud__preview-doc">
              <i :class="getFileIcon(previewModal.url)"></i>
              <div>
                <strong>{{ previewModal.title }}</strong>
                <p>{{ getFileName(previewModal.url) }}</p>
                <button
                  type="button"
                  class="ud__file-action-btn"
                  @click="openFileUrl(previewModal.url)"
                >
                  Abrir archivo
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- ProfileForm component -->
    <ProfileForm
      ref="profileForm"
      :profileData="userData"
      :isEditing="true"
      :canEditSection="canEditSection"
      :canSeeTechnical="canSeeTechnical"
      @update="onUserUpdated"
      @close="onFormClosed"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, reactive, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/composables/usePermissions'
import { getAll, remove } from '@/services/api'
import {
  formatFecha,
  formatFechaEntera,
  getDriveEmbedUrl,
  getDriveImageUrl,
} from '@/utils/forms_consts'
import { formatPhone } from '@/utils/phone'
import ProfileForm from '@/components/ProfileForm.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { can, canEditSection, canSeeTechnical, canAccessUser, getLevelName } = usePermissions()

const profileForm = ref(null)
const userData = ref({})
const loading = ref(true)
const notFound = ref(false)
const noPermission = ref(false)
const accordionId = 'userAccordion'

// Estado de acordeones (custom — sin Bootstrap JS)
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

const imageLoadError = reactive({
  foto_dni: false,
  foto_rostro: false,
})
const handleImageLoadError = (fieldName) => {
  imageLoadError[fieldName] = true
}

const toggleSection = (section) => {
  openSections[section] = !openSections[section]
}

const fileActionFor = ref(null)
const previewModal = ref({
  open: false,
  title: '',
  url: '',
  isImage: false,
  extension: '',
})

const isImageUrl = (value) => {
  if (!value || typeof value !== 'string') return false
  if (/^data:image\//i.test(value)) return true
  if (/\.(jpe?g|png|gif|bmp|webp|svg)(\?.*)?$/i.test(value)) return true
  return false
}

const isValidFileLink = (value) => {
  if (!value || typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!trimmed) return false
  const normalized = trimmed
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  if (/^no cargo estudios medicos$/i.test(normalized)) return false
  return true
}

const getFileExtension = (value) => {
  if (!value || typeof value !== 'string') return ''
  const match = value.match(/\.([a-z0-9]{2,5})(?:\?.*)?$/i)
  return match ? match[1].toLowerCase() : ''
}

const getFileName = (value) => {
  if (!value || typeof value !== 'string') return ''
  try {
    return decodeURIComponent(value.split('/').pop().split('?')[0])
  } catch {
    return value
  }
}

const getFileIcon = (value) => {
  const ext = getFileExtension(value)
  switch (ext) {
    case 'pdf':
      return 'bi bi-file-earmark-pdf'
    case 'doc':
    case 'docx':
      return 'bi bi-file-earmark-word'
    case 'xls':
    case 'xlsx':
      return 'bi bi-file-earmark-excel'
    case 'ppt':
    case 'pptx':
      return 'bi bi-file-earmark-ppt'
    case 'txt':
      return 'bi bi-file-earmark-text'
    default:
      return 'bi bi-file-earmark'
  }
}

const toggleFileActions = (url, title) => {
  if (!isValidFileLink(url)) {
    fileActionFor.value = null
    return
  }
  if (fileActionFor.value?.url === url) {
    fileActionFor.value = null
    return
  }
  fileActionFor.value = {
    url,
    title,
    isImage: isImageUrl(url),
  }
}

// Close tooltips when clicking outside
const closeFileActions = () => {
  fileActionFor.value = null
}

// Handle clicks outside of pills
onMounted(() => {
  const handleClickOutside = (event) => {
    const pillWrapper = event.target.closest('.ud__file-pill-wrapper')
    if (!pillWrapper) {
      closeFileActions()
    }
  }
  document.addEventListener('click', handleClickOutside)

  // Cleanup on unmount
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})

const openPreviewModal = (url, title) => {
  if (!isValidFileLink(url)) return
  const isImage = isImageUrl(url)
  const normalizedUrl = isImage ? getDriveImageUrl(url) : getDriveEmbedUrl(url)
  previewModal.value = {
    open: true,
    title,
    url: normalizedUrl,
    isImage,
    extension: getFileExtension(url),
    embed: !isImage,
  }
  fileActionFor.value = null
}

const closePreviewModal = () => {
  previewModal.value.open = false
}

const openFileUrl = (url) => {
  if (!isValidFileLink(url)) return
  window.open(url, '_blank', 'noopener')
}

// Computed: verificar si puede editar
const canEdit = computed(() => {
  if (!authStore.user) return false
  const targetDni = parseInt(route.params.dni)
  return canAccessUser(targetDni, userData.value)
})

onMounted(async () => {
  if (!authStore.user || authStore.user.it_level < 1) {
    noPermission.value = true
    return
  }
  await loadUserData()
})

const loadUserData = async () => {
  try {
    loading.value = true
    const dni = parseInt(route.params.dni)

    const [mainResponse, usersResponse] = await Promise.all([getAll('main'), getAll('users')])

    const mainData = mainResponse.data
    const usersData = usersResponse.data

    const mainRecord = mainData.find((record) => record.DNI === dni)
    const userRecord = usersData.find((user) => user.dni === dni)

    if (!mainRecord && !userRecord) {
      notFound.value = true
      return
    }

    if (!canAccessUser(dni, mainRecord)) {
      noPermission.value = true
      return
    }

    userData.value = {
      dni: dni,
      DNI: dni,
      CUIL: mainRecord?.CUIL || '',
      nombre: mainRecord?.nombre || '',
      apellido: mainRecord?.apellido || '',
      genero: mainRecord?.genero || '',
      nacimiento: mainRecord?.nacimiento || '',
      celular: mainRecord?.celular || userRecord?.cellphone || '',
      mail_operativo: mainRecord?.mail_operativo || '',
      mail_personal: mainRecord?.mail_personal || '',
      direccion1: mainRecord?.direccion1 || '',
      barrio1: mainRecord?.barrio1 || '',
      direccion2: mainRecord?.direccion2 || '',
      barrio2: mainRecord?.barrio2 || '',
      foto_dni: mainRecord?.foto_dni || '',
      foto_rostro: mainRecord?.foto_rostro || '',
      obraSocial: mainRecord?.obraSocial || '',
      obraSocial_Plan: mainRecord?.obraSocial_Plan || '',
      obraSocial_id: mainRecord?.obraSocial_id || '',
      obraSocial_Carnet: mainRecord?.obraSocial_Carnet || '',
      med_dieta: mainRecord?.med_dieta || '',
      med_sangre: mainRecord?.med_sangre || '',
      med_historia: mainRecord?.med_historia || '',
      med_problemas: mainRecord?.med_problemas || '',
      med_act: mainRecord?.med_act || '',
      med_actLesion: mainRecord?.med_actLesion || '',
      med_estudios: mainRecord?.med_estudios || '',
      med_estudios_extras: mainRecord?.med_estudios_extras || '',
      med_estudios_extraMotivo: mainRecord?.med_estudios_extraMotivo || '',
      med_estudios_pdf: mainRecord?.med_estudios_pdf || '',
      med_estudios_certificado: mainRecord?.med_estudios_certificado || '',
      med_estudios_fecha: mainRecord?.med_estudios_fecha || '',
      med_estudios_img: mainRecord?.med_estudios_img || '',
      med_estudios_otro: mainRecord?.med_estudios_otro || '',
      organizacion: mainRecord?.organizacion || '',
      areas: mainRecord?.areas || '',
      areas_ref: mainRecord?.areas_ref || '',
      apodo: mainRecord?.apodo || '',
      activo: mainRecord?.activo || false,
      nivel: mainRecord?.nivel || '',
      nivelHBTJ: mainRecord?.nivelHBTJ || '',
      fecha_ingresoOrg: mainRecord?.fecha_ingresoOrg || '',
      fecha_ingresoMilu: mainRecord?.fecha_ingresoMilu || '',
      areas_historicas: mainRecord?.areas_historicas || '',
      curso_CB: mainRecord?.curso_CB || '',
      curso_TL: mainRecord?.curso_TL || '',
      curso_AvH: mainRecord?.curso_AvH || '',
      curso_AvKM: mainRecord?.curso_AvKM || '',
      curso_IE: mainRecord?.curso_IE || '',
      curso_FND: mainRecord?.curso_FND || '',
      curso_IEIns: mainRecord?.curso_IEIns || '',
      curso_CR: mainRecord?.curso_CR || '',
      curso_CARE: mainRecord?.curso_CARE || '',
      cursos_tiempo: mainRecord?.cursos_tiempo || '',
      estudios_grado: mainRecord?.estudios_grado || '',
      estudios_area: mainRecord?.estudios_area || '',
      estudios_carrera: mainRecord?.estudios_carrera || '',
      estudios_barrio: mainRecord?.estudios_barrio || '',
      trabajo_area: mainRecord?.trabajo_area || '',
      trabajo_puesto: mainRecord?.trabajo_puesto || '',
      trabajo_barrio: mainRecord?.trabajo_barrio || '',
      comunidad_actividad: mainRecord?.comunidad_actividad || '',
      comunidad_rol: mainRecord?.comunidad_rol || '',
      fam1_nombre: mainRecord?.fam1_nombre || '',
      fam1_apellido: mainRecord?.fam1_apellido || '',
      fam1_vinculo: mainRecord?.fam1_vinculo || '',
      fam1_celular: mainRecord?.fam1_celular || '',
      fam1_direccion: mainRecord?.fam1_direccion || '',
      fam2_nombre: mainRecord?.fam2_nombre || '',
      fam2_apellido: mainRecord?.fam2_apellido || '',
      fam2_vinculo: mainRecord?.fam2_vinculo || '',
      fam2_celular: mainRecord?.fam2_celular || '',
      fam2_direccion: mainRecord?.fam2_direccion || '',
      ID_JVR: mainRecord?.ID_JVR || '',
      it_level: userRecord?.it_level || 0,
      telegram_id: mainRecord?.telegram_id || '',
      fecha_ult: mainRecord?.fecha_ult || '',
    }
    imageLoadError.foto_dni = false
    imageLoadError.foto_rostro = false
  } catch (error) {
    console.error('Error loading user data:', error)
    notFound.value = true
  } finally {
    loading.value = false
  }
}

const openEditForm = async () => {
  if (canEdit.value) {
    if (!profileForm.value) {
      await nextTick()
    }
    if (profileForm.value?.open) {
      profileForm.value.open()
    } else {
      console.warn('ProfileForm component is not available')
    }
  }
}

const onUserUpdated = () => {
  loadUserData()
}

const onFormClosed = () => {
  // Formulario cerrado
}

const handleDelete = async () => {
  if (
    !confirm('¿Estás seguro que deseas eliminar este usuario? Esta acción no se puede deshacer.')
  ) {
    return
  }
  try {
    loading.value = true
    await remove('main', userData.value.DNI)
    try {
      await remove('users', userData.value.dni)
    } catch (err) {
      console.log('No se pudo eliminar de users (puede no existir)')
    }
    router.push('/')
  } catch (error) {
    console.error('Error deleting user:', error)
    alert('Error al eliminar el usuario')
  } finally {
    loading.value = false
  }
}

const getLevelBadgeClass = (level) => {
  const classes = {
    0: 'level-0',
    1: 'level-1',
    2: 'level-2',
    3: 'level-3',
  }
  return classes[level] || 'level-0'
}

const getLevelDescription = (level) => {
  const descriptions = {
    0: 'Sin acceso - No puede realizar operaciones',
    1: 'Básico - Solo ve su propio perfil. Edita: personal, contacto, domicilio, médicos, desarrollo, familia',
    2: 'Intermedio - Ve usuarios de sus áreas. Edita: personal, contacto, domicilio, médicos, desarrollo, familia, organización',
    3: 'Avanzado - Acceso total a todos los usuarios, incluyendo datos técnicos',
  }
  return descriptions[level] || 'Nivel desconocido'
}
</script>

<style scoped>
/* ── Variables ── */
.ud {
  --c-bg: #f4f6fb;
  --c-surface: #ffffff;
  --c-border: #e5e9f2;
  --c-text: #1a1d2e;
  --c-text-muted: #6b7280;
  --c-accent: #4361ee;
  --c-radius: 12px;
  --c-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.05);

  min-height: 100vh;
  background: var(--c-bg);
  padding: 1.5rem;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ── Header ── */
.ud__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.ud__header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.ud__back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 9px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  color: var(--c-text);
  text-decoration: none;
  font-size: 1rem;
  flex-shrink: 0;
  transition:
    background 0.15s,
    border-color 0.15s;
  box-shadow: var(--c-shadow);
}

.ud__back-btn:hover {
  background: #eef2ff;
  border-color: var(--c-accent);
  color: var(--c-accent);
}

.ud__header-eyebrow {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--c-text-muted);
  margin: 0 0 0.15rem;
}

.ud__header-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--c-text);
  margin: 0;
  line-height: 1.2;
}

.ud__header-title--placeholder {
  color: var(--c-text-muted);
}

.ud__header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ud__readonly-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  background: #fef9c3;
  color: #854d0e;
  border: 1px solid #fde68a;
}

.ud__edit-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1.1rem;
  border-radius: 9px;
  background: var(--c-accent);
  color: white;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s,
    transform 0.15s;
}

.ud__edit-btn:hover:not(:disabled) {
  background: #2d4fd4;
  transform: translateY(-1px);
}

.ud__edit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Alerts ── */
.ud__alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1.25rem;
  border-radius: var(--c-radius);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.ud__alert--danger {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.ud__alert--warning {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
}

/* ── Body layout ── */
.ud__body {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 1.5rem;
  align-items: start;
}

/* ── Loading ── */
.ud__loading {
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

.ud__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--c-border);
  border-top-color: var(--c-accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Accordion ── */
.ud__accordion {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ud__acc-item {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--c-radius);
  overflow: hidden;
  box-shadow: var(--c-shadow);
}

.ud__acc-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--c-text);
  text-align: left;
  transition: background 0.15s;
}

.ud__acc-trigger:hover {
  background: #f8fafc;
}

.ud__acc-trigger.open {
  border-bottom: 1px solid var(--c-border);
}

.ud__acc-trigger-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.ud__acc-icon {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.ud__acc-icon--blue {
  background: #dbeafe;
  color: #1e40af;
}
.ud__acc-icon--green {
  background: #dcfce7;
  color: #166534;
}
.ud__acc-icon--orange {
  background: #ffedd5;
  color: #9a3412;
}
.ud__acc-icon--red {
  background: #fee2e2;
  color: #991b1b;
}
.ud__acc-icon--purple {
  background: #ede9fe;
  color: #5b21b6;
}
.ud__acc-icon--teal {
  background: #ccfbf1;
  color: #0f766e;
}
.ud__acc-icon--amber {
  background: #fef9c3;
  color: #854d0e;
}
.ud__acc-icon--gray {
  background: #f1f5f9;
  color: #475569;
}

.ud__acc-chevron {
  color: var(--c-text-muted);
  transition: transform 0.25s;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.ud__acc-chevron.rotated {
  transform: rotate(180deg);
}

.ud__acc-body {
  padding: 1rem 1.1rem;
}

/* ── Fields grid ── */
.ud__fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem 1rem;
  margin-bottom: 0.25rem;
}

.ud__field {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.ud__field--full {
  grid-column: 1 / -1;
}

.ud__field-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--c-text-muted);
}

.ud__field-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--c-text);
  word-break: break-word;
}

.ud__image-card {
  display: inline-grid;
  width: 130px;
  height: 130px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--c-border);
  background: #ffffff;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.ud__image-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.ud__image-card-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: #475569;
  background: #f8fafc;
}

.ud__image-card-fallback i {
  font-size: 2.2rem;
}

.ud__file-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.9rem;
  border-radius: 999px;
  border: 1px solid var(--c-border);
  background: #f8fafc;
  color: var(--c-text);
  font-weight: 600;
  cursor: pointer;
  min-width: 180px;
  text-align: left;
  transition: all 0.15s ease;
}

.ud__file-pill:hover:not(.ud__file-pill--disabled) {
  background: #eef2ff;
  border-color: rgba(67, 97, 238, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.15);
}

.ud__file-pill:active:not(.ud__file-pill--disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(67, 97, 238, 0.2);
}

.ud__file-pill--disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background: #f4f5f8;
  border-color: #e5e7eb;
  color: #6b7280;
}

.ud__file-pill--active {
  background: #dbeafe;
  border-color: #3b82f6;
  color: #1e40af;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.ud__file-pill i {
  font-size: 1rem;
}

.ud__file-pill-wrapper {
  position: relative;
  display: inline-flex;
}

.ud__file-actions {
  position: absolute;
  top: calc(100% + 0.45rem);
  left: 0;
  z-index: 11;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0;
  padding: 0.85rem;
  min-width: 220px;
  background: #ffffff;
  border: 1px solid var(--c-border);
  border-radius: 16px;
  box-shadow: 0 18px 40px rgba(16, 24, 40, 0.08);
}

.ud__file-action-btn {
  width: 100%;
  text-align: left;
  border: 1px solid var(--c-border);
  background: #ffffff;
  color: var(--c-text);
  padding: 0.55rem 0.9rem;
  border-radius: 999px;
  font-size: 0.85rem;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.ud__file-action-btn:hover {
  background: #eef2ff;
  border-color: rgba(67, 97, 238, 0.3);
}

.ud__preview-image {
  width: 100%;
  max-height: 65vh;
  object-fit: contain;
  border-radius: 18px;
  display: block;
}

.ud__preview-frame {
  width: 100%;
  min-height: 60vh;
  border: 1px solid var(--c-border);
  border-radius: 14px;
}

.ud__preview-doc {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid var(--c-border);
  border-radius: 16px;
  background: #f8fafc;
}

.ud__preview-doc i {
  font-size: 2rem;
  color: #4361ee;
}

.ud__preview-doc p {
  margin: 0.25rem 0 0;
  color: var(--c-text-muted);
}

@media (max-width: 860px) {
  .ud__body {
    grid-template-columns: 1fr;
  }
  .ud__fields {
    grid-template-columns: 1fr;
  }
  .ud__image-card {
    width: 100%;
    max-width: 240px;
    height: 170px;
  }
  .ud__file-pill-wrapper {
    width: 100%;
    position: relative;
  }
  .ud__file-pill {
    width: 100%;
    min-width: unset;
    padding: 0.7rem 1rem;
    font-size: 0.875rem;
  }
  .ud__file-actions {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    width: auto;
    min-width: 200px;
    max-width: calc(100vw - 2rem);
    z-index: 1000;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    border-radius: 12px;
    margin-top: 0;
    padding: 0.75rem;
  }
  .ud__file-action-btn {
    padding: 0.7rem 1rem;
    font-size: 0.875rem;
    border-radius: 8px;
  }
}

/* Extra small screens */
@media (max-width: 480px) {
  .ud {
    padding: 1rem;
  }
  .ud__file-pill {
    padding: 0.8rem 1.1rem;
    gap: 0.6rem;
    min-height: 44px; /* iOS touch target minimum */
    display: flex;
    align-items: center;
  }
  .ud__file-pill i {
    font-size: 1.1rem;
    flex-shrink: 0;
  }
  .ud__file-actions {
    left: -0.5rem;
    right: -0.5rem;
    min-width: unset;
    max-width: unset;
    width: calc(100% + 1rem);
    padding: 0.6rem;
    border-radius: 12px;
  }
  .ud__file-action-btn {
    padding: 0.8rem 1.1rem;
    min-height: 44px; /* iOS touch target minimum */
    font-size: 0.9rem;
    display: flex;
    align-items: center;
  }
}

.ud__field-value--mono {
  font-family: 'Courier New', monospace;
  font-size: 0.82rem;
}

.ud__field-value--link {
  color: #2563eb;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.ud__field-value--link:hover {
  text-decoration: underline;
}

.ud__subsection-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--c-accent);
  margin: 1rem 0 0.5rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--c-border);
}

/* Badges */
.ud__status-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.55rem;
  border-radius: 6px;
}

.ud__status-badge.active {
  background: #dcfce7;
  color: #166534;
}
.ud__status-badge.inactive {
  background: #f1f5f9;
  color: #475569;
}

.ud__it-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.55rem;
  border-radius: 6px;
}

.ud__it-badge.level-0 {
  background: #f1f5f9;
  color: #475569;
}
.ud__it-badge.level-1 {
  background: #dcfce7;
  color: #166534;
}
.ud__it-badge.level-2 {
  background: #fef9c3;
  color: #854d0e;
}
.ud__it-badge.level-3 {
  background: #fee2e2;
  color: #991b1b;
}

/* ── Sidebar ── */
.ud__sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 80px;
}

.ud__info-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--c-radius);
  overflow: hidden;
  box-shadow: var(--c-shadow);
}

.ud__info-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #0ea5e9, #3b82f6);
  color: white;
  font-size: 0.82rem;
  font-weight: 600;
}

.ud__info-card-body {
  padding: 1rem;
  font-size: 0.82rem;
  color: var(--c-text-muted);
  line-height: 1.6;
}

.ud__info-card-body p {
  margin: 0 0 0.75rem;
}

.ud__info-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #16a34a;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.82rem;
}

.ud__info-link:hover {
  text-decoration: underline;
}

.ud__sidebar-edit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.65rem 1rem;
  border-radius: 9px;
  background: var(--c-accent);
  color: white;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.ud__sidebar-edit-btn:hover:not(:disabled) {
  background: #2d4fd4;
}
.ud__sidebar-edit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .ud__body {
    grid-template-columns: 1fr;
  }

  .ud__sidebar {
    position: static;
    order: -1;
  }

  .ud__sidebar-edit-btn {
    display: none;
  }
}

@media (max-width: 600px) {
  .ud {
    padding: 1rem;
  }

  .ud__fields {
    grid-template-columns: 1fr;
  }

  .ud__header-title {
    font-size: 1.2rem;
  }

  .ud__edit-btn span {
    display: none;
  }
  .ud__edit-btn {
    padding: 0.5rem 0.65rem;
  }
}
</style>
