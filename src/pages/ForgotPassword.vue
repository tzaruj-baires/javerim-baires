<template>
  <div class="auth-shell">
    <!-- Panel decorativo izquierdo (solo desktop) -->
    <div class="auth-deco" aria-hidden="true">
      <div class="auth-deco__inner">
        <div class="auth-deco__logo">✦</div>
        <h2 class="auth-deco__headline">Javerim Baires</h2>
        <p class="auth-deco__sub">Vamos a ayudarte a<br />recuperar el acceso.</p>
        <div class="auth-deco__steps">
          <div class="auth-deco__step" :class="{ active: step >= 1, done: step > 1 }">
            <span>1</span> Verificar identidad
          </div>
          <div class="auth-deco__step" :class="{ active: step >= 2, done: step > 2 }">
            <span>2</span> Nueva contraseña
          </div>
          <div class="auth-deco__step" :class="{ active: step >= 3 }"><span>3</span> Listo</div>
        </div>
      </div>
    </div>

    <!-- Panel de formulario -->
    <div class="auth-panel">
      <div class="auth-card">
        <!-- Logo mobile -->
        <div class="auth-card__mobile-brand">
          <span class="auth-card__mobile-logo">✦</span>
          <span>Javerim Baires</span>
        </div>

        <!-- Stepper mobile -->
        <div class="auth-stepper-mobile">
          <div
            v-for="n in 3"
            :key="n"
            class="auth-stepper-mobile__dot"
            :class="{ active: step >= n, done: step > n }"
          ></div>
        </div>

        <!-- Alertas -->
        <div v-if="successMessage" class="jv-alert jv-alert--success auth-alert">
          <i class="bi bi-check-circle"></i> {{ successMessage }}
          <button class="jv-alert__close" @click="successMessage = ''">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div v-if="errorMessage" class="jv-alert jv-alert--danger auth-alert">
          <i class="bi bi-exclamation-circle"></i> {{ errorMessage }}
          <button class="jv-alert__close" @click="errorMessage = ''">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- ── Paso 1: Verificar identidad ── -->
        <div v-if="step === 1">
          <div class="auth-card__header">
            <div class="auth-card__step-badge">Paso 1 de 2</div>
            <h1 class="auth-card__title">Verificar identidad</h1>
            <p class="auth-card__subtitle">Ingresá tu DNI y email para verificar tu identidad</p>
          </div>
          <form @submit.prevent="verifyIdentity" class="auth-form">
            <div class="auth-field">
              <label class="auth-label" for="dni">DNI</label>
              <input
                v-model.number="verificationData.dni"
                type="number"
                class="auth-input"
                id="dni"
                placeholder="12345678"
                required
                autocomplete="off"
              />
            </div>
            <div class="auth-field">
              <label class="auth-label" for="email">Email</label>
              <input
                v-model="verificationData.email"
                type="email"
                class="auth-input"
                id="email"
                placeholder="usuario@example.com"
                required
                autocomplete="email"
              />
            </div>
            <button type="submit" class="auth-submit-btn" :disabled="isLoading">
              <span v-if="!isLoading">
                <i class="bi bi-shield-check"></i> Verificar Identidad
              </span>
              <span v-else class="auth-loading">
                <span class="auth-spinner"></span> Verificando...
              </span>
            </button>
          </form>
        </div>

        <!-- ── Paso 2: Nueva contraseña ── -->
        <div v-if="step === 2">
          <div class="auth-card__header">
            <div class="auth-card__step-badge">Paso 2 de 2</div>
            <h1 class="auth-card__title">Nueva contraseña</h1>
            <p class="auth-card__subtitle">Ingresá y confirmá tu nueva contraseña</p>
          </div>
          <form @submit.prevent="resetPassword" class="auth-form">
            <div class="auth-field">
              <label class="auth-label" for="newPassword">Nueva Contraseña</label>
              <div class="auth-input-group">
                <input
                  v-model="resetData.newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  class="auth-input"
                  id="newPassword"
                  placeholder="Mínimo 6 caracteres"
                  required
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  class="auth-eye-btn"
                  @click="showNewPassword = !showNewPassword"
                  tabindex="-1"
                >
                  <i :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
            </div>
            <div class="auth-field">
              <label class="auth-label" for="confirmNewPassword">Confirmar Contraseña</label>
              <div class="auth-input-group">
                <input
                  v-model="resetData.confirmPassword"
                  :type="showConfirmNewPassword ? 'text' : 'password'"
                  class="auth-input"
                  :class="{
                    'auth-input--match':
                      resetData.confirmPassword &&
                      resetData.newPassword === resetData.confirmPassword,
                    'auth-input--mismatch':
                      resetData.confirmPassword &&
                      resetData.newPassword !== resetData.confirmPassword,
                  }"
                  id="confirmNewPassword"
                  placeholder="••••••••"
                  required
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  class="auth-eye-btn"
                  @click="showConfirmNewPassword = !showConfirmNewPassword"
                  tabindex="-1"
                >
                  <i :class="showConfirmNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              <span
                v-if="
                  resetData.confirmPassword && resetData.newPassword !== resetData.confirmPassword
                "
                class="auth-field-error"
              >
                <i class="bi bi-x-circle"></i> Las contraseñas no coinciden
              </span>
            </div>
            <button type="submit" class="auth-submit-btn" :disabled="isLoading">
              <span v-if="!isLoading"> <i class="bi bi-key"></i> Establecer Contraseña </span>
              <span v-else class="auth-loading">
                <span class="auth-spinner"></span> Actualizando...
              </span>
            </button>
          </form>
        </div>

        <!-- ── Paso 3: Éxito ── -->
        <div v-if="step === 3" class="auth-success">
          <div class="auth-success__icon">
            <i class="bi bi-check-circle-fill"></i>
          </div>
          <h2 class="auth-success__title">¡Contraseña actualizada!</h2>
          <p class="auth-success__text">
            Tu contraseña fue restablecida exitosamente. Ya podés iniciar sesión con tus nuevas
            credenciales.
          </p>
          <router-link
            to="/login"
            class="auth-submit-btn"
            style="display: block; text-align: center; text-decoration: none; margin-top: 0.5rem"
          >
            <i class="bi bi-box-arrow-in-right"></i> Ir a Iniciar Sesión
          </router-link>
        </div>

        <!-- Footer links -->
        <div class="auth-footer-links" v-if="step < 3">
          <router-link to="/login" class="auth-footer-link-item">
            <i class="bi bi-arrow-left"></i> Volver a Iniciar Sesión
          </router-link>
          <router-link to="/signin" class="auth-footer-link-item auth-footer-link-item--muted">
            ¿No tenés cuenta? Registrate
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const step = ref(1)

const verificationData = ref({
  dni: '',
  email: '',
})

const resetData = ref({
  newPassword: '',
  confirmPassword: '',
})

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const showNewPassword = ref(false)
const showConfirmNewPassword = ref(false)

const verifyIdentity = async () => {
  try {
    errorMessage.value = ''
    successMessage.value = ''

    if (!verificationData.value.dni || !verificationData.value.email) {
      errorMessage.value = 'Por favor completá todos los campos'
      return
    }

    if (verificationData.value.dni.toString().length !== 8) {
      errorMessage.value = 'DNI debe tener 8 dígitos'
      return
    }

    isLoading.value = true

    await authStore.verifyUserIdentity({
      dni: verificationData.value.dni,
      email: verificationData.value.email,
    })

    successMessage.value = '¡Identidad verificada! Ahora establecé tu nueva contraseña'
    setTimeout(() => {
      step.value = 2
      successMessage.value = ''
    }, 1500)
  } catch (error) {
    errorMessage.value = error.message || 'Error al verificar identidad'
  } finally {
    isLoading.value = false
  }
}

const resetPassword = async () => {
  try {
    errorMessage.value = ''
    successMessage.value = ''

    if (!resetData.value.newPassword || !resetData.value.confirmPassword) {
      errorMessage.value = 'Por favor completá todos los campos'
      return
    }

    if (resetData.value.newPassword.length < 6) {
      errorMessage.value = 'La contraseña debe tener al menos 6 caracteres'
      return
    }

    if (resetData.value.newPassword !== resetData.value.confirmPassword) {
      errorMessage.value = 'Las contraseñas no coinciden'
      return
    }

    isLoading.value = true

    await authStore.resetPassword({
      dni: verificationData.value.dni,
      email: verificationData.value.email,
      newPassword: resetData.value.newPassword,
    })

    successMessage.value = '¡Contraseña actualizada exitosamente!'
    setTimeout(() => {
      step.value = 3
      successMessage.value = ''
    }, 1500)
  } catch (error) {
    errorMessage.value = error.message || 'Error al actualizar contraseña'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@import '@/assets/css/styles.css';

/* ── Shell layout ── */
.auth-shell {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--jv-bg);
  font-family: var(--jv-font);
}

/* ── Deco panel ── */
.auth-deco {
  background: linear-gradient(150deg, #1e3a8a 0%, #4361ee 55%, #7c3aed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  position: relative;
  overflow: hidden;
}

.auth-deco::before {
  content: '';
  position: absolute;
  top: -80px;
  right: -80px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
}

.auth-deco::after {
  content: '';
  position: absolute;
  bottom: -60px;
  left: 40px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
}

.auth-deco__inner {
  position: relative;
  z-index: 1;
  color: white;
  max-width: 320px;
}

.auth-deco__logo {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  animation: auth-pulse 3s ease-in-out infinite;
}

@keyframes auth-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.auth-deco__headline {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.75rem;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.auth-deco__sub {
  font-size: 1rem;
  opacity: 0.75;
  line-height: 1.6;
  margin: 0 0 2rem;
}

/* Stepper on deco panel */
.auth-deco__steps {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.auth-deco__step {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  opacity: 0.4;
  transition: opacity 0.3s;
}

.auth-deco__step.active {
  opacity: 1;
}
.auth-deco__step.done {
  opacity: 0.65;
}

.auth-deco__step span {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
  flex-shrink: 0;
}

.auth-deco__step.active span {
  background: white;
  color: var(--jv-accent);
  border-color: white;
}

.auth-deco__step.done span {
  background: rgba(255, 255, 255, 0.3);
  border-color: transparent;
}

/* ── Form panel ── */
.auth-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow-y: auto;
}

.auth-card {
  width: 100%;
  max-width: 400px;
}

/* Mobile brand */
.auth-card__mobile-brand {
  display: none;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--jv-text);
  margin-bottom: 1.5rem;
}

.auth-card__mobile-logo {
  color: var(--jv-accent);
  font-size: 1.1rem;
}

/* Stepper dots mobile */
.auth-stepper-mobile {
  display: none;
  gap: 0.4rem;
  margin-bottom: 1.75rem;
}

.auth-stepper-mobile__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--jv-border);
  transition:
    background 0.2s,
    width 0.2s;
}

.auth-stepper-mobile__dot.active {
  background: var(--jv-accent);
  width: 24px;
  border-radius: 4px;
}

.auth-stepper-mobile__dot.done {
  background: #93c5fd;
}

/* Card header */
.auth-card__step-badge {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--jv-accent);
  background: #eef2ff;
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
  margin-bottom: 0.6rem;
}

.auth-card__header {
  margin-bottom: 1.5rem;
}

.auth-card__title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--jv-text);
  margin: 0 0 0.4rem;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.auth-card__subtitle {
  font-size: 0.9rem;
  color: var(--jv-text-muted);
  margin: 0;
}

/* Alert */
.auth-alert {
  margin-bottom: 1.25rem;
  font-size: 0.85rem;
}

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.auth-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.auth-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--jv-text-muted);
}

.auth-input-group {
  position: relative;
}

.auth-input {
  width: 100%;
  padding: 0.65rem 0.9rem;
  border: 1.5px solid var(--jv-border);
  border-radius: 9px;
  font-size: 0.925rem;
  color: var(--jv-text);
  background: var(--jv-surface);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  box-sizing: border-box;
  font-family: var(--jv-font);
}

.auth-input:focus {
  outline: none;
  border-color: var(--jv-accent);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.12);
}

.auth-input-group .auth-input {
  padding-right: 2.8rem;
}

.auth-input--match {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.auth-input--mismatch {
  border-color: var(--jv-danger);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.auth-eye-btn {
  position: absolute;
  right: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--jv-text-muted);
  font-size: 0.9rem;
  padding: 0.2rem;
  transition: color 0.15s;
  line-height: 1;
}

.auth-eye-btn:hover {
  color: var(--jv-accent);
}

.auth-field-error {
  font-size: 0.72rem;
  color: var(--jv-danger);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* Submit */
.auth-submit-btn {
  width: 100%;
  padding: 0.75rem;
  border-radius: 9px;
  background: var(--jv-accent);
  color: white;
  border: none;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.15s,
    transform 0.15s;
  margin-top: 0.25rem;
  font-family: var(--jv-font);
  box-sizing: border-box;
}

.auth-submit-btn:hover:not(:disabled) {
  background: var(--jv-accent-hover);
  transform: translateY(-1px);
}

.auth-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-loading {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}

.auth-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: white;
  border-radius: 50%;
  animation: auth-spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes auth-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Success state ── */
.auth-success {
  text-align: center;
  padding: 1rem 0;
}

.auth-success__icon {
  font-size: 3.5rem;
  color: #10b981;
  margin-bottom: 1rem;
  animation: auth-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes auth-pop {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.auth-success__title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--jv-text);
  margin: 0 0 0.6rem;
}

.auth-success__text {
  font-size: 0.9rem;
  color: var(--jv-text-muted);
  margin: 0 0 1.5rem;
  line-height: 1.6;
}

/* Footer links */
.auth-footer-links {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.auth-footer-link-item {
  font-size: 0.875rem;
  color: var(--jv-accent);
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.auth-footer-link-item:hover {
  text-decoration: underline;
}

.auth-footer-link-item--muted {
  font-size: 0.8rem;
  color: var(--jv-text-muted);
  font-weight: 400;
}

.auth-footer-link-item--muted:hover {
  color: var(--jv-accent);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }
  .auth-deco {
    display: none;
  }
  .auth-card__mobile-brand {
    display: flex;
  }
  .auth-stepper-mobile {
    display: flex;
  }
  .auth-panel {
    align-items: flex-start;
    padding: 2rem 1.25rem;
    min-height: 100dvh;
  }
}
</style>
