
<template>
  <f7-app v-bind="f7params">
    <f7-view main url="/" />
    <AppTabbar />
  </f7-app>
</template>

<script setup>
import { f7App, f7View } from 'framework7-vue'
import AppTabbar from './components/AppTabbar.vue'
import routes from './routes.js'

const f7params = {
  name: 'TaskFlow',
  theme: 'auto',
  routes,
}
</script>
