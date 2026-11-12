
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import Framework7 from 'framework7/lite-bundle'
import Framework7Vue, {
  f7App,
  f7View,
  f7Page,
  f7Navbar,
  f7NavRight,
  f7Link,
  f7Block,
  f7BlockTitle,
  f7List,
  f7ListItem,
  f7ListInput,
  f7Button
} from 'framework7-vue'

import 'framework7/css/bundle'
import './style.css'

import App from './App.vue'
import { initializePersistence } from './services/persistence.js'

Framework7.use(Framework7Vue)

const app = createApp(App)

// Підключення Pinia
const pinia = createPinia()
app.use(pinia)

// Підключення Framework7
app.use(Framework7Vue)

// Реєстрація компонентів Framework7
const components = {
  f7App,
  f7View,
  f7Page,
  f7Navbar,
  f7NavRight,
  f7Link,
  f7Block,
  f7BlockTitle,
  f7List,
  f7ListItem,
  f7ListInput,
  f7Button
}

Object.entries(components).forEach(([name, component]) => {
  app.component(name, component)
})

// Відновлення даних перед запуском застосунку
async function startApp() {
  try {
    await initializePersistence(pinia)
    console.log('IndexedDB: дані успішно відновлено')
  } catch (error) {
    console.error(
      'Не вдалося відновити дані з IndexedDB:',
      error
    )
  }

  app.mount('#app')
}

startApp()
