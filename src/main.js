import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/css/styles.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
