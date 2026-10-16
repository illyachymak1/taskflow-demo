
<template>
  <f7-page name="home">
    <f7-navbar title="TaskFlow">
      <f7-nav-right>
        <f7-link href="/about/">Про застосунок</f7-link>
      </f7-nav-right>
    </f7-navbar>

    <f7-block-title>Мої завдання</f7-block-title>

    <f7-list strong inset dividers>
      <f7-list-item
        v-for="task in tasks"
        :key="task.id"
        :title="task.title"
        :subtitle="'Пріоритет: ' + task.priority"
        :after="task.done ? 'Готово' : 'В роботі'"
        checkbox
        :checked="task.done"
        @change="task.done = !task.done"
      />
    </f7-list>

    <f7-block-title>Додати завдання</f7-block-title>

    <f7-list strong inset>
      <f7-list-input
        label="Назва завдання"
        type="text"
        placeholder="Введіть назву"
        :value="newTask"
        @input="newTask = $event.target.value"
      />
    </f7-list>

    <f7-block>
      <f7-button fill @click="addTask">
        Додати завдання
      </f7-button>
    </f7-block>
  </f7-page>
</template>

<script setup>
import { ref, watch } from 'vue'

const STORAGE_KEY = 'taskflow-tasks'

const defaultTasks = [
  {
    id: 1,
    title: 'Виконати практичну роботу',
    priority: 'Високий',
    done: false,
  },
  {
    id: 2,
    title: 'Завантажити проєкт на GitHub',
    priority: 'Середній',
    done: false,
  },
  {
    id: 3,
    title: 'Перевірити роботу PWA',
    priority: 'Низький',
    done: true,
  },
]

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved !== null) {
      const parsed = JSON.parse(saved)

      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (error) {
    console.error('Failed to load tasks:', error)
  }

  return defaultTasks
}

const tasks = ref(loadTasks())
const newTask = ref('')

watch(
  tasks,
  (updatedTasks) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedTasks)
      )
    } catch (error) {
      console.error('Failed to save tasks:', error)
    }
  },
  { deep: true }
)

function addTask() {
  const title = newTask.value.trim()

  if (!title) return

  tasks.value.push({
    id: crypto.randomUUID(),
    title,
    priority: 'Середній',
    done: false,
  })

  newTask.value = ''
}
</script>
