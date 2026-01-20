<script setup>
  import { onMounted } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import Navbar from '@/components/Navbar.vue'
  import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js'

  const authStore = useAuthStore()

  onMounted(() => {
    // Cargar usuario guardado en localStorage
    authStore.loadUserFromStorage()
  })
</script>

<template>
  <Navbar />
  <router-view></router-view>  
</template>

<style scoped>
  @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css');
  @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css');
</style>
