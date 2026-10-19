
<template>
  <div class="bottom-nav">
    <a
      v-for="item in menu"
      :key="item.path"
      href="#"
      class="nav-item"
      :class="{ active: currentPath === item.path }"
      @click.prevent="navigate(item.path)"
    >
      <span class="nav-icon">{{ item.icon }}</span>
      <span>{{ item.title }}</span>
    </a>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { f7 } from 'framework7-vue'

const currentPath = ref('/')

const menu = [
  { path: '/', title: 'Головна', icon: '⌂' },
  { path: '/tasks/', title: 'Завдання', icon: '☷' },
  { path: '/about/', title: 'Про застосунок', icon: 'ⓘ' },
]

function navigate(path) {
  const view = f7.views.main

  if (!view) return

  view.router.navigate(path)
  currentPath.value = path
}
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
  color: #777;
  text-decoration: none;
  font-size: 12px;
}

.nav-icon {
  font-size: 25px;
}

.nav-item.active {
  color: #4b628f;
  font-weight: bold;
}
</style>
