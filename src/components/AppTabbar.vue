
<template>
  <nav class="bottom-nav" aria-label="Основна навігація">
    <a
      v-for="item in menu"
      :key="item.path"
      :href="item.path"
      class="nav-item"
      :class="{ active: currentPath === item.path }"
      :aria-label="item.title"
      :aria-current="currentPath === item.path ? 'page' : undefined"
      @click.prevent="navigate(item.path)"
    >
      <span class="nav-icon" aria-hidden="true">
        {{ item.icon }}
      </span>
      <span>{{ item.title }}</span>
    </a>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { f7 } from 'framework7-vue'

const currentPath = ref('/')

const menu = [
  { path: '/', title: 'Головна', icon: '⌂' },
  { path: '/tasks/', title: 'Завдання', icon: '☷' },
  { path: '/about/', title: 'Про застосунок', icon: 'ⓘ' },
]

function updateCurrentPath() {
  const path = f7.views.main?.router?.currentRoute?.path

  if (path) {
    currentPath.value = path
  }
}

function navigate(path) {
  const view = f7.views.main

  if (!view) return

  view.router.navigate(path)
  currentPath.value = path
}

onMounted(() => {
  f7.on('routeChange', updateCurrentPath)
  updateCurrentPath()
})

onUnmounted(() => {
  f7.off('routeChange', updateCurrentPath)
})
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid #ddd;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
  z-index: 99999;
}

.nav-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #666;
  text-decoration: none;
  font-size: 12px;
  min-height: 48px;
}

.nav-icon {
  font-size: 25px;
}

.nav-item.active {
  color: #7952b3;
  font-weight: bold;
}

.nav-item:focus-visible {
  outline: 3px solid #7952b3;
  outline-offset: -4px;
  border-radius: 8px;
}

@media (max-width: 400px) {
  .nav-item {
    font-size: 11px;
    gap: 4px;
  }

  .nav-icon {
    font-size: 23px;
  }
}
</style>
