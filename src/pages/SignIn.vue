<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">Registro de Usuario</h4>
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

            <form @submit.prevent="handleRegister">
              <!-- DNI -->
              <div class="mb-3">
                <label for="dni" class="form-label">DNI (8 dígitos)</label>
                <input
                  v-model.number="formData.dni"
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
                  v-model="formData.email"
                  type="email"
                  class="form-control"
                  id="email"
                  placeholder="usuario@example.com"
                  required
                />
              </div>

              <!-- Teléfono -->
              <div class="mb-3">
                <label for="cellphone" class="form-label">Teléfono</label>
                <input
                  v-model.number="formData.cellphone"
                  type="tel"
                  class="form-control"
                  id="cellphone"
                  placeholder="1123456789"
                  required
                />
              </div>

              <!-- Contraseña -->
              <div class="mb-3">
                <label for="password" class="form-label">Contraseña</label>
                <div class="input-group">
                  <input
                    v-model="formData.password"
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control"
                    id="password"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="showPassword = !showPassword"
                  >
                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
              </div>

              <!-- Confirmar Contraseña -->
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirmar Contraseña</label>
                <div class="input-group">
                  <input
                    v-model="formData.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="form-control"
                    id="confirmPassword"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
              </div>

              <!-- Botón Registrarse -->
              <button type="submit" class="btn btn-primary w-100 mb-2" :disabled="isLoading">
                <span v-if="!isLoading">Registrarse</span>
                <span v-else>
                  <span
                    class="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Registrando...
                </span>
              </button>

              <!-- Links de navegación -->
              <p class="text-center mt-3">
                ¿Ya tienes cuenta?
                <router-link to="/login" class="text-primary">Inicia sesión</router-link>
              </p>
              <p class="text-center">
                <router-link to="/forgot-password" class="text-muted text-decoration-none">
                  <small>¿Olvidaste tu contraseña?</small>
                </router-link>
              </p>
            </form>
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

    // Validaciones
    if (
      !formData.value.dni ||
      !formData.value.email ||
      !formData.value.cellphone ||
      !formData.value.password
    ) {
      errorMessage.value = 'Por favor completa todos los campos'
      return
    }

    if (formData.value.dni.toString().length !== 8) {
      errorMessage.value = 'DNI debe tener 8 dígitos'
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

    // Registrar usuario
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
.card {
  border: none;
  border-radius: 8px;
}

.card-header {
  border-radius: 8px 8px 0 0;
}
</style>
