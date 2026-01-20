<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card shadow">
          <div class="card-header bg-success text-white">
            <h4 class="mb-0">Iniciar Sesión</h4>
          </div>
          <div class="card-body">
            <!-- Mensaje de éxito o error -->
            <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
              {{ successMessage }}
              <button type="button" class="btn-close" @click="successMessage = ''"></button>
            </div>
            <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
              {{ errorMessage }}
              <button type="button" class="btn-close" @click="errorMessage = ''"></button>
            </div>

            <form @submit.prevent="handleLogin">
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

              <!-- Contraseña -->
              <div class="mb-3">
                <label for="password" class="form-label">Contraseña</label>
                <input 
                  v-model="formData.password" 
                  type="password" 
                  class="form-control" 
                  id="password"
                  placeholder="••••••••"
                  required
                />
              </div>

              <!-- Botón Iniciar Sesión -->
              <button 
                type="submit" 
                class="btn btn-success w-100 mb-2"
                :disabled="isLoading"
              >
                <span v-if="!isLoading">Iniciar Sesión</span>
                <span v-else>
                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Verificando...
                </span>
              </button>

              <!-- Link a Registro -->
              <p class="text-center mt-3">
                ¿No tienes cuenta? 
                <router-link to="/signin" class="text-success">Regístrate aquí</router-link>
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
  email: '',
  password: ''
})

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const handleLogin = async () => {
  try {
    errorMessage.value = ''
    successMessage.value = ''

    if (!formData.value.email || !formData.value.password) {
      errorMessage.value = 'Por favor completa todos los campos'
      return
    }

    isLoading.value = true

    // Login
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
.card {
  border: none;
  border-radius: 8px;
}

.card-header {
  border-radius: 8px 8px 0 0;
}
</style>