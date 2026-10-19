
<template>
  <f7-app v-bind="f7params">
    <f7-view main url="/" />
    <AppTabbar />
  </f7-app>
</template>

<script setup>
import AppTabbar from './components/AppTabbar.vue'
import routes from './routes.js'

const f7params = {
  name: 'TaskFlow',
  theme: 'auto',
  routes,
}
</script>

<style>
/* Новий колір активного пункту навігації */
:root {
  --f7-theme-color: #7952b3;
  --f7-theme-color-rgb: 121, 82, 179;
}

.tabbar .tab-link-active,
.toolbar .tab-link-active,
.tabbar .link.active,
.toolbar .link.active {
  color: #7952b3 !important;
}

.tabbar .tab-link-active i,
.toolbar .tab-link-active i,
.tabbar .link.active i,
.toolbar .link.active i {
  color: #7952b3 !important;
}

/* Картки на вузькому екрані */
@media (max-width: 600px) {
  .stats-container {
    grid-template-columns: 1fr !important;
    gap: 10px !important;
  }

  .stat-card {
    padding: 14px 12px !important;
    border-radius: 12px !important;
  }

  .stat-number {
    font-size: 24px !important;
  }

  .stat-label {
    font-size: 13px !important;
  }
}
</style>
