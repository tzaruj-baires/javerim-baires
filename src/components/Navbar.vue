<template>
  <nav class="navbar sticky-top" :class="{ 'navbar--scrolled': scrolled }">
    <div class="navbar__inner">
      <!-- Logo -->
      <router-link to="/" class="navbar__brand">
        <span class="navbar__brand-icon"
          ><img src="/public/favicon.png" alt="✦" height="24"
        /></span>
        <span class="navbar__brand-text">Javerim Baires</span>
      </router-link>

      <!-- Botón hamburguesa (mobile) -->
      <button
        class="navbar__toggle"
        @click="menuOpen = !menuOpen"
        :aria-expanded="menuOpen"
        aria-label="Toggle navigation"
        v-if="authStore.isAuthenticated || true"
      >
        <span class="navbar__toggle-bar" :class="{ open: menuOpen }"></span>
        <span class="navbar__toggle-bar" :class="{ open: menuOpen }"></span>
        <span class="navbar__toggle-bar" :class="{ open: menuOpen }"></span>
      </button>

      <!-- Menú -->
      <div class="navbar__menu" :class="{ 'navbar__menu--open': menuOpen }">
        <!-- No autenticado -->
        <template v-if="!authStore.isAuthenticated">
          <router-link
            to="/login"
            class="navbar__link navbar__link--outline"
            @click="menuOpen = false"
          >
            <i class="bi bi-box-arrow-in-right"></i> Iniciar Sesión
          </router-link>
          <router-link
            to="/signin"
            class="navbar__link navbar__link--solid"
            @click="menuOpen = false"
          >
            <i class="bi bi-person-plus"></i> Registrarse
          </router-link>
        </template>

        <!-- Autenticado -->
        <template v-else>
          <!-- Info del usuario (visible en mobile) -->
          <div class="navbar__user-info">
            <div class="navbar__user-avatar">
              {{ (authStore.user?.nickname || authStore.user?.email || '?')[0].toUpperCase() }}
            </div>
            <div class="navbar__user-details">
              <span class="navbar__user-name">{{
                authStore.user?.nickname || authStore.user?.email
              }}</span>
              <span class="navbar__user-email">{{ authStore.user?.email }}</span>
            </div>
          </div>

          <div class="navbar__divider"></div>

          <router-link
            :to="`/javer/${authStore.user?.dni}`"
            class="navbar__item"
            @click="menuOpen = false"
          >
            <i class="bi bi-person"></i> Mi Perfil
          </router-link>

          <template v-if="can(2)">
            <div class="navbar__divider"></div>
            <a class="navbar__item" href="#" @click.prevent="menuOpen = false">
              <i class="bi bi-gear"></i> Configuración
            </a>
            <router-link to="/mis-areas" class="navbar__item" @click="menuOpen = false">
              <i class="bi bi-diagram-3"></i> Mis Áreas
            </router-link>
          </template>

          <template v-if="can(3)">
            <div class="navbar__divider"></div>
            <router-link
              to="/admin/users"
              class="navbar__item navbar__item--admin"
              @click="menuOpen = false"
            >
              <i class="bi bi-shield-lock"></i> Administración de Usuarios
            </router-link>
          </template>

          <template v-if="can(2) || can(3)">
            <router-link
              to="/areas-y-roshim"
              class="navbar__item navbar__item--admin"
              @click="menuOpen = false"
            >
              <i class="bi bi-stack"></i> Áreas y Roshim
            </router-link>
          </template>

          <div class="navbar__divider"></div>
          <button @click="handleLogout" class="navbar__item navbar__item--danger">
            <i class="bi bi-box-arrow-right"></i> Cerrar Sesión
          </button>
        </template>
      </div>

      <!-- Overlay mobile -->
      <div class="navbar__overlay" v-if="menuOpen" @click="menuOpen = false"></div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/composables/usePermissions'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const { can, getLevelName } = usePermissions()

const menuOpen = ref(false)
const scrolled = ref(false)

const handleScroll = () => {
  scrolled.value = window.scrollY > 12
}

const handleLogout = () => {
  authStore.logout()
  menuOpen.value = false
  router.push('/login')
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
/* ── Variables ── */
.navbar {
  --nav-bg: #0f1117;
  --nav-bg-scrolled: rgba(15, 17, 23, 0.97);
  --nav-border: rgba(255, 255, 255, 0.07);
  --nav-text: #e8e8f0;
  --nav-text-muted: #888;
  --nav-accent: #6c8fff;
  --nav-accent-hover: #89a4ff;
  --nav-danger: #ff6b6b;
  --nav-admin: #ffd166;
  --nav-radius: 10px;
  --nav-height: 60px;

  background: var(--nav-bg);
  border-bottom: 1px solid var(--nav-border);
  height: var(--nav-height);
  transition:
    background 0.3s,
    box-shadow 0.3s;
  z-index: 1000;
}

.navbar--scrolled {
  background: var(--nav-bg-scrolled);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
}

/* ── Layout ── */
.navbar__inner {
  display: flex;
  align-items: center;
  height: var(--nav-height);
  padding: 0 1.25rem;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

/* ── Brand ── */
.navbar__brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  font-family: 'Georgia', serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--nav-text);
  letter-spacing: 0.02em;
  white-space: nowrap;
  flex-shrink: 0;
}

.navbar__brand-icon {
  color: var(--nav-accent);
  font-size: 1rem;
  animation: pulse 3s ease-in-out infinite;
}

.navbar__brand-icon img {
  position: relative;
  bottom: 2px;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.navbar__brand:hover .navbar__brand-text {
  color: var(--nav-accent-hover);
}

/* ── Level badge (desktop) ── */
.navbar__actions {
  margin-left: auto;
  margin-right: 1rem;
}

.navbar__level-badge {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  background: rgba(108, 143, 255, 0.15);
  color: var(--nav-accent);
  border: 1px solid rgba(108, 143, 255, 0.3);
}

/* ── Toggle (hamburguesa) ── */
.navbar__toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  margin-left: auto;
  z-index: 1001;
}

.navbar__toggle-bar {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--nav-text);
  border-radius: 2px;
  transition:
    transform 0.3s,
    opacity 0.3s;
}

/* ── Menu ── */
.navbar__menu {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;
}

/* Links no autenticado */
.navbar__link {
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  transition: all 0.2s;
  white-space: nowrap;
}

.navbar__link--outline {
  color: var(--nav-text);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.navbar__link--outline:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.4);
}

.navbar__link--solid {
  color: #0f1117;
  background: var(--nav-accent);
  border: 1px solid transparent;
}

.navbar__link--solid:hover {
  background: var(--nav-accent-hover);
}

/* Items menú autenticado (solo visibles en mobile) */
.navbar__user-info,
.navbar__divider,
.navbar__item {
  display: none;
}

/* ── Overlay ── */
.navbar__overlay {
  display: none;
}

/* ========================================
   RESPONSIVE: Mobile
======================================== */
@media (max-width: 768px) {
  .navbar__actions {
    display: none;
  }

  .navbar__toggle {
    display: flex;
  }

  .navbar__menu {
    position: fixed;
    top: 0;
    right: -280px;
    width: 280px;
    height: 100dvh;
    background: #16181f;
    border-left: 1px solid var(--nav-border);
    flex-direction: column;
    align-items: stretch;
    padding: 5rem 0 2rem;
    gap: 0;
    transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
    overflow-y: auto;
  }

  .navbar__menu--open {
    right: 0;
  }

  .navbar__overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    backdrop-filter: blur(2px);
  }

  /* User info block */
  .navbar__user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem 1rem;
  }

  .navbar__user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--nav-accent), #a78bfa);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1rem;
    color: white;
    flex-shrink: 0;
  }

  .navbar__user-details {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .navbar__user-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--nav-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .navbar__user-email {
    font-size: 0.75rem;
    color: var(--nav-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Divider */
  .navbar__divider {
    display: block;
    height: 1px;
    background: var(--nav-border);
    margin: 0.25rem 0;
  }

  /* Nav items */
  .navbar__item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
    color: var(--nav-text);
    text-decoration: none;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s;
  }

  .navbar__item:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--nav-accent-hover);
  }

  .navbar__item--admin {
    color: var(--nav-admin);
  }

  .navbar__item--admin:hover {
    color: var(--nav-admin);
    background: rgba(255, 209, 102, 0.07);
  }

  .navbar__item--danger {
    color: var(--nav-danger);
  }

  .navbar__item--danger:hover {
    background: rgba(255, 107, 107, 0.07);
    color: var(--nav-danger);
  }

  /* Links de no autenticado en mobile */
  .navbar__link {
    display: block;
    margin: 0.5rem 1.25rem;
    text-align: center;
  }
}

/* ========================================
   RESPONSIVE: Desktop - user dropdown
======================================== */
@media (min-width: 769px) {
  .navbar__menu {
    position: static;
    flex-direction: row;
  }

  /* En desktop, los items solo están visibles en el menú mobile,
     así que mostramos solo los links de no-autenticado + avatar dropdown */
  .navbar__user-info,
  .navbar__divider,
  .navbar__item {
    /* Ya ocultos por defecto – en desktop usamos dropdown si se necesita */
    display: none;
  }

  /* Mostramos el toggle también como dropdown en desktop */
  .navbar__toggle {
    display: flex;
  }

  .navbar__menu--open .navbar__user-info,
  .navbar__menu--open .navbar__divider,
  .navbar__menu--open .navbar__item {
    display: flex;
  }

  .navbar__menu--open .navbar__user-info {
    display: flex;
  }

  .navbar__menu--open .navbar__divider {
    display: block;
  }

  /* Panel lateral también en desktop */
  .navbar__menu {
    position: fixed;
    top: 0;
    right: -280px;
    width: 280px;
    height: 100dvh;
    background: #16181f;
    border-left: 1px solid var(--nav-border);
    flex-direction: column;
    align-items: stretch;
    padding: 5rem 0 2rem;
    gap: 0;
    transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
    overflow-y: auto;
    margin-left: 0;
  }

  .navbar__menu--open {
    right: 0;
  }

  .navbar__overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    backdrop-filter: blur(2px);
  }

  .navbar__user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem 1rem;
  }

  .navbar__user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--nav-accent), #a78bfa);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1rem;
    color: white;
    flex-shrink: 0;
  }

  .navbar__user-details {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .navbar__user-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--nav-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .navbar__user-email {
    font-size: 0.75rem;
    color: var(--nav-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .navbar__item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
    color: var(--nav-text);
    text-decoration: none;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s;
  }

  .navbar__item:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--nav-accent-hover);
  }

  .navbar__item--admin {
    color: var(--nav-admin);
  }

  .navbar__item--admin:hover {
    color: var(--nav-admin);
    background: rgba(255, 209, 102, 0.07);
  }

  .navbar__item--danger {
    color: var(--nav-danger);
  }

  .navbar__item--danger:hover {
    background: rgba(255, 107, 107, 0.07);
    color: var(--nav-danger);
  }
}
</style>
