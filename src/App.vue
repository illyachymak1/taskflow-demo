
<template>
  <f7-app v-bind="f7params">
    <f7-view main url="/" />
  </f7-app>
</template>

<script setup>
import routes from './routes.js'

const f7params = {
  name: 'TaskFlow',
  theme: 'auto',
  routes,
}
</script>
