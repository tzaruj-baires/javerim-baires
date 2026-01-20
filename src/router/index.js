import Home from '@/pages/Home.vue'
import Login from '@/pages/Login.vue'
import SignIn from '@/pages/SignIn.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/signin',
      name: 'signin',
      component: SignIn,
      meta: { requiresAuth: false }
    }
  ],
})

// Guard de rutas global
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !authStore.isAuthenticated) {
    // Si la ruta requiere autenticación y no está autenticado, redirigir a login
    next('/login')
  } else if (!requiresAuth && authStore.isAuthenticated && (to.path === '/login' || to.path === '/signin')) {
    // Si ya está autenticado y trata de ir a login/signin, redirigir a home
    next('/')
  } else {
    next()
  }
})

export default router
