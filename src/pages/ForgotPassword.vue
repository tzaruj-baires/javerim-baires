<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-header bg-warning text-dark">
            <h4 class="mb-0">Recuperar Contraseña</h4>
          </div>
          <div class="card-body">
            <!-- Mensaje de éxito o error -->
            <div
              v-if="successMessage"
              class="alert alert-success alert-dismissible fade show"
              role="alert"
            >
              {{ successMessage }}
              <button type="button" class="btn-close" @click="successMessage = ''"></button>
            </div>
            <div
              v-if="errorMessage"
              class="alert alert-danger alert-dismissible fade show"
              role="alert"
            >
              {{ errorMessage }}
              <button type="button" class="btn-close" @click="errorMessage = ''"></button>
            </div>

            <!-- Paso 1: Verificación de identidad -->
            <div v-if="step === 1">
              <p class="text-muted mb-4">Ingresa tu DNI y email para verificar tu identidad</p>
              <form @submit.prevent="verifyIdentity">
                <!-- DNI -->
                <div class="mb-3">
                  <label for="dni" class="form-label">DNI</label>
                  <input
                    v-model.number="verificationData.dni"
                    type="number"
                    class="form-control"
                    id="dni"
                    placeholder="12345678"
                    required
                  />
                </div>

                <!-- Email -->
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    v-model="verificationData.email"
                    type="email"
                    class="form-control"
                    id="email"
                    placeholder="usuario@example.com"
                    required
                  />
                </div>

                <button type="submit" class="btn btn-warning w-100" :disabled="isLoading">
                  <span v-if="!isLoading">Verificar Identidad</span>
                  <span v-else>
                    <span
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Verificando...
                  </span>
                </button>
              </form>
            </div>

            <!-- Paso 2: Establecer nueva contraseña -->
            <div v-if="step === 2">
              <p class="text-muted mb-4">Ingresa tu nueva contraseña</p>
              <form @submit.prevent="resetPassword">
                <!-- Nueva contraseña -->
                <div class="mb-3">
                  <label for="newPassword" class="form-label">Nueva Contraseña</label>
                  <div class="input-group">
                    <input
                      v-model="resetData.newPassword"
                      :type="showNewPassword ? 'text' : 'password'"
                      class="form-control"
                      id="newPassword"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="showNewPassword = !showNewPassword"
                    >
                      <i :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                    </button>
                  </div>
                </div>

                <!-- Confirmar nueva contraseña -->
                <div class="mb-3">
                  <label for="confirmNewPassword" class="form-label">Confirmar Contraseña</label>
                  <div class="input-group">
                    <input
                      v-model="resetData.confirmPassword"
                      :type="showConfirmNewPassword ? 'text' : 'password'"
                      class="form-control"
                      id="confirmNewPassword"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="showConfirmNewPassword = !showConfirmNewPassword"
                    >
                      <i :class="showConfirmNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                    </button>
                  </div>
                </div>

                <button type="submit" class="btn btn-warning w-100" :disabled="isLoading">
                  <span v-if="!isLoading">Establecer Nueva Contraseña</span>
                  <span v-else>
                    <span
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Actualizando...
                  </span>
                </button>
              </form>
            </div>

            <!-- Paso 3: Éxito -->
            <div v-if="step === 3" class="text-center">
              <div class="mb-3">
                <i class="bi bi-check-circle text-success" style="font-size: 3rem"></i>
              </div>
              <h5 class="text-success mb-3">¡Contraseña actualizada!</h5>
              <p class="text-muted mb-4">Tu contraseña ha sido restablecida exitosamente.</p>
              <router-link to="/login" class="btn btn-primary w-100">
                Ir a Iniciar Sesión
              </router-link>
            </div>

            <!-- Links de navegación -->
            <p class="text-center mt-3">
              <router-link to="/login" class="text-primary">Volver a Inicia sesión</router-link>
            </p>
            <p class="text-center">
              <router-link to="/signin" class="text-muted text-decoration-none">
                <small>¿No tienes cuenta? Regístrate</small>
              </router-link>
            </p>
          </div>
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

const step = ref(1) // 1: Verificación, 2: Resetear contraseña, 3: Éxito

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

    // Validaciones
    if (!verificationData.value.dni || !verificationData.value.email) {
      errorMessage.value = 'Por favor completa todos los campos'
      return
    }

    if (verificationData.value.dni.toString().length !== 8) {
      errorMessage.value = 'DNI debe tener 8 dígitos'
      return
    }

    isLoading.value = true

    // Verificar identidad
    await authStore.verifyUserIdentity({
      dni: verificationData.value.dni,
      email: verificationData.value.email,
    })

    successMessage.value = '¡Identidad verificada! Ahora establece tu nueva contraseña'
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

    // Validaciones
    if (!resetData.value.newPassword || !resetData.value.confirmPassword) {
      errorMessage.value = 'Por favor completa todos los campos'
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

    // Resetear contraseña
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
.card {
  border: none;
  border-radius: 8px;
}

.card-header {
  border-radius: 8px 8px 0 0;
}
</style>
