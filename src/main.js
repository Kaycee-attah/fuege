import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

// Add persistence plugin
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

if (process.env.NODE_ENV === 'production') {
  app.config.devtools = false
}

app.mount('#app')