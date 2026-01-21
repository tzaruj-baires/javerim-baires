<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top">
    <div class="container-fluid">
      <!-- Logo/Marca -->
      <router-link to="/" class="navbar-brand fw-bold">
        <i class="bi bi-app"></i> Javerim Baires
      </router-link>

      <!-- Botón de Toggle para mobile -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Contenido de la navbar -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <!-- Links de navegación -->
        <ul class="navbar-nav ms-auto align-items-center">
          <!-- Si NO está autenticado -->
          <li class="nav-item" v-if="!authStore.isAuthenticated">
            <router-link to="/login" class="nav-link btn btn-outline-light btn-sm me-2">
              <i class="bi bi-box-arrow-in-right"></i> Iniciar Sesión
            </router-link>
          </li>
          <li class="nav-item" v-if="!authStore.isAuthenticated">
            <router-link to="/signin" class="nav-link btn btn-light btn-sm">
              <i class="bi bi-person-plus"></i> Registrarse
            </router-link>
          </li>

          <!-- Si está autenticado -->

          <li class="nav-item dropdown" v-if="authStore.isAuthenticated">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              id="navbarDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i class="bi bi-person-circle"></i>
              {{ authStore.user?.nickname || authStore.user?.email }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
              <li>
                <a class="dropdown-item disabled" href="#">
                  <i class="bi bi-envelope"></i> {{ authStore.user?.email }}
                </a>
              </li>
              <li>
                <a class="dropdown-item disabled" href="#">
                  <i class="bi bi-bar-chart"></i> Nivel:
                  {{ getLevelName(authStore.user?.it_level) }}
                </a>
              </li>
              <li>
                <hr class="dropdown-divider" />
              </li>
              <li>
                <router-link :to="`/javer/${authStore.user?.dni}`" class="dropdown-item">
                  <i class="bi bi-person"></i> Mi Perfil
                </router-link>
              </li>
              <li v-if="can(2)">
                <hr class="dropdown-divider" />
              </li>
              <!-- Opciones solo para nivel 2+ -->
              <li v-if="can(2)">
                <a class="dropdown-item" href="#"> <i class="bi bi-gear"></i> Configuración </a>
              </li>
              <li v-if="can(2)">
                <a class="dropdown-item" href="#"> <i class="bi bi-graph-up"></i> Reportes </a>
              </li>
              <!-- Opciones solo para nivel 3 -->
              <li v-if="can(3)">
                <hr class="dropdown-divider" />
              </li>
              <li v-if="can(3)">
                <router-link to="/admin/users" class="dropdown-item text-warning">
                  <i class="bi bi-shield-lock"></i> Administración de Usuarios
                </router-link>
              </li>
              <li v-if="can(3)">
                <a class="dropdown-item text-warning" href="#">
                  <i class="bi bi-graph-up"></i> Reportes
                </a>
              </li>
              <li>
                <hr class="dropdown-divider" />
              </li>
              <li>
                <button @click="handleLogout" class="dropdown-item text-danger">
                  <i class="bi bi-box-arrow-right"></i> Cerrar Sesión
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/composables/usePermissions'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const { can, getLevelName } = usePermissions()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar-brand {
  font-size: 1.5rem;
}

.nav-link.btn {
  border-radius: 0.25rem;
  font-size: 0.9rem;
  white-space: nowrap;
}

.dropdown-menu {
  min-width: 250px;
}

.dropdown-item.disabled {
  color: #6c757d;
  cursor: default;
  background-color: transparent;
}

.dropdown-item.disabled:hover {
  background-color: transparent;
}

.badge {
  font-size: 0.75rem;
  padding: 0.4rem 0.6rem;
}
</style>
