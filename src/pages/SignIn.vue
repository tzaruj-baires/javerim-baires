<template>
  <div class="auth-shell">
    <!-- Panel decorativo izquierdo (solo desktop) -->
    <div class="auth-deco" aria-hidden="true">
      <div class="auth-deco__inner">
        <div class="auth-deco__logo">✦</div>
        <h2 class="auth-deco__headline">Javerim Baires</h2>
        <p class="auth-deco__sub">Creá tu cuenta y formá parte<br />de la comunidad.</p>
        <div class="auth-deco__dots"><span></span><span></span><span></span></div>
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

        <div class="auth-card__header">
          <h1 class="auth-card__title">Crear cuenta</h1>
          <p class="auth-card__subtitle">Completá tus datos para registrarte</p>
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

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="auth-field">
            <label class="auth-label" for="dni">DNI</label>
            <input
              v-model.number="formData.dni"
              type="number"
              class="auth-input"
              id="dni"
              placeholder="12345678"
              min="1000000"
              max="100000000"
              required
              autocomplete="off"
            />
            <span class="auth-hint">Verificá el número dos veces antes de continuar</span>
          </div>

          <div class="auth-field">
            <label class="auth-label" for="email">Email</label>
            <input
              v-model="formData.email"
              type="email"
              class="auth-input"
              id="email"
              placeholder="usuario@example.com"
              required
              autocomplete="email"
            />
          </div>

          <div class="auth-field">
            <label class="auth-label" for="cellphone">Teléfono</label>
            <input
              v-model.number="formData.cellphone"
              type="tel"
              class="auth-input"
              id="cellphone"
              placeholder="1123456789"
              required
              autocomplete="tel"
            />
          </div>

          <!-- Separador visual -->
          <div class="auth-divider">
            <span>Seguridad</span>
          </div>

          <div class="auth-field">
            <label class="auth-label" for="password">Contraseña</label>
            <div class="auth-input-group">
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                class="auth-input"
                id="password"
                placeholder="Mínimo 6 caracteres"
                required
                autocomplete="new-password"
              />
              <button
                type="button"
                class="auth-eye-btn"
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>

          <div class="auth-field">
            <label class="auth-label" for="confirmPassword">Confirmar Contraseña</label>
            <div class="auth-input-group">
              <input
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="auth-input"
                :class="{
                  'auth-input--match':
                    formData.confirmPassword && formData.password === formData.confirmPassword,
                  'auth-input--mismatch':
                    formData.confirmPassword && formData.password !== formData.confirmPassword,
                }"
                id="confirmPassword"
                placeholder="••••••••"
                required
                autocomplete="new-password"
              />
              <button
                type="button"
                class="auth-eye-btn"
                @click="showConfirmPassword = !showConfirmPassword"
                tabindex="-1"
              >
                <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <span
              v-if="formData.confirmPassword && formData.password !== formData.confirmPassword"
              class="auth-field-error"
            >
              <i class="bi bi-x-circle"></i> Las contraseñas no coinciden
            </span>
          </div>

          <button type="submit" class="auth-submit-btn" :disabled="isLoading">
            <span v-if="!isLoading"> <i class="bi bi-person-plus"></i> Registrarse </span>
            <span v-else class="auth-loading">
              <span class="auth-spinner"></span> Registrando...
            </span>
          </button>
        </form>

        <p class="auth-footer-link">
          ¿Ya tenés cuenta?
          <router-link to="/login">Iniciá sesión</router-link>
        </p>
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

const formData = ref({
  dni: '',
  email: '',
  cellphone: '',
  password: '',
  confirmPassword: '',
})

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const handleRegister = async () => {
  try {
    errorMessage.value = ''
    successMessage.value = ''

    if (
      !formData.value.dni ||
      !formData.value.email ||
      !formData.value.cellphone ||
      !formData.value.password
    ) {
      errorMessage.value = 'Por favor completá todos los campos'
      return
    }

    if (!(formData.value.dni.toString().length >= 7 && formData.value.dni.toString().length <= 8)) {
      errorMessage.value = 'DNI debe tener entre 7 u 8 dígitos'
      return
    }

    if (formData.value.password !== formData.value.confirmPassword) {
      errorMessage.value = 'Las contraseñas no coinciden'
      return
    }

    if (formData.value.password.length < 6) {
      errorMessage.value = 'La contraseña debe tener al menos 6 caracteres'
      return
    }

    isLoading.value = true

    await authStore.register({
      dni: formData.value.dni,
      email: formData.value.email,
      cellphone: formData.value.cellphone,
      password: formData.value.password,
    })

    successMessage.value = '¡Registro exitoso! Redirigiendo...'
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error) {
    errorMessage.value = error.message || 'Error al registrar usuario'
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

.auth-deco__dots {
  display: flex;
  gap: 0.5rem;
}

.auth-deco__dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
}

.auth-deco__dots span:first-child {
  background: rgba(255, 255, 255, 0.9);
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
  padding: 0.5rem 0;
}

/* Mobile brand */
.auth-card__mobile-brand {
  display: none;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--jv-text);
  margin-bottom: 2rem;
}

.auth-card__mobile-logo {
  color: var(--jv-accent);
  font-size: 1.1rem;
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
  gap: 1rem;
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

.auth-hint {
  font-size: 0.72rem;
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

/* Divider */
.auth-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.25rem 0;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--jv-border);
}

.auth-divider span {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--jv-text-muted);
  white-space: nowrap;
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

/* Footer link */
.auth-footer-link {
  text-align: center;
  font-size: 0.875rem;
  color: var(--jv-text-muted);
  margin-top: 1.5rem;
}

.auth-footer-link a {
  color: var(--jv-accent);
  font-weight: 600;
  text-decoration: none;
}

.auth-footer-link a:hover {
  text-decoration: underline;
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
  .auth-panel {
    align-items: flex-start;
    padding: 2rem 1.25rem;
  }
}
</style>
