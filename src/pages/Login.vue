<template>
  <div class="auth-shell">
    <!-- Panel decorativo izquierdo (solo desktop) -->
    <div class="auth-deco" aria-hidden="true">
      <div class="auth-deco__inner">
        <div class="auth-deco__logo">✦</div>
        <h2 class="auth-deco__headline">Javerim Baires</h2>
        <p class="auth-deco__sub">El espacio de tu comunidad,<br />siempre a mano.</p>
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
          <h1 class="auth-card__title">Bienvenido de vuelta</h1>
          <p class="auth-card__subtitle">Ingresá tus datos para continuar</p>
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

        <form @submit.prevent="handleLogin" class="auth-form">
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
            <div class="auth-label-row">
              <label class="auth-label" for="password">Contraseña</label>
              <router-link to="/forgot-password" class="auth-forgot">
                ¿Olvidaste tu contraseña?
              </router-link>
            </div>
            <div class="auth-input-group">
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                class="auth-input"
                id="password"
                placeholder="••••••••"
                required
                autocomplete="current-password"
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

          <button type="submit" class="auth-submit-btn" :disabled="isLoading">
            <span v-if="!isLoading"> <i class="bi bi-box-arrow-in-right"></i> Iniciar Sesión </span>
            <span v-else class="auth-loading">
              <span class="auth-spinner"></span> Verificando...
            </span>
          </button>
        </form>

        <p class="auth-footer-link">
          ¿No tenés cuenta?
          <router-link to="/signin">Registrate acá</router-link>
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
  email: '',
  password: '',
})

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  try {
    errorMessage.value = ''
    successMessage.value = ''

    if (!formData.value.email || !formData.value.password) {
      errorMessage.value = 'Por favor completá todos los campos'
      return
    }

    isLoading.value = true

    await authStore.login(formData.value.email, formData.value.password)

    successMessage.value = '¡Sesión iniciada correctamente! Redirigiendo...'
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch (error) {
    errorMessage.value = error.message || 'Error al iniciar sesión'
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
}

.auth-card {
  width: 100%;
  max-width: 400px;
}

/* Mobile brand (hidden on desktop) */
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

/* Card header */
.auth-card__header {
  margin-bottom: 1.75rem;
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

.auth-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.auth-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--jv-text-muted);
}

.auth-forgot {
  font-size: 0.78rem;
  color: var(--jv-accent);
  text-decoration: none;
}

.auth-forgot:hover {
  text-decoration: underline;
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
    min-height: 100dvh;
  }

  .auth-card {
    padding-top: 1rem;
  }
}
</style>
