
import { createApp } from 'vue'

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

Framework7.use(Framework7Vue)

const app = createApp(App)

app.use(Framework7Vue)

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

app.mount('#app')
