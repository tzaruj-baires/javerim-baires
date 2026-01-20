import Home from '@/pages/Home.vue'
import Login from '@/pages/Login.vue'
import SignIn from '@/pages/SignIn.vue'
import UserDetail from '@/pages/UserDetail.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresAuth: false },
    },
    {
      path: '/signin',
      name: 'signin',
      component: SignIn,
      meta: { requiresAuth: false },
    },
    {
      path: '/javer/:dni',
      name: 'userDetail',
      component: UserDetail,
      meta: { requiresAuth: true, minLevel: 1 },
    },
  ],
})

// Guard de rutas global
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const minLevel = to.matched.find((record) => record.meta.minLevel)?.meta.minLevel

  if (requiresAuth && !authStore.isAuthenticated) {
    // Si la ruta requiere autenticación y no está autenticado, redirigir a login
    next('/login')
  } else if (
    !requiresAuth &&
    authStore.isAuthenticated &&
    (to.path === '/login' || to.path === '/signin')
  ) {
    // Si ya está autenticado y trata de ir a login/signin, redirigir a home
    next('/')
  } else if (minLevel && authStore.isAuthenticated && authStore.user.it_level < minLevel) {
    // Si la ruta requiere un nivel mínimo y el usuario no lo tiene, redirigir a home
    next('/')
  } else if (to.path === '/mi-perfil' && authStore.isAuthenticated) {
    // Redirigir /mi-perfil a /javer/:dni (perfil del usuario actual)
    next(`/javer/${authStore.user.dni}`)
  } else {
    next()
  }
})

export default router
