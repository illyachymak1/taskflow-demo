
import { ref, watch } from 'vue'

const savedTasks = localStorage.getItem('taskflow-tasks')

const defaultTasks = [
  {
    id: 1,
    title: 'Виконати практичну роботу',
    priority: 'Високий',
    done: false
  },
  {
    id: 2,
    title: 'Завантажити проєкт на GitHub',
    priority: 'Середній',
    done: false
  },
  {
    id: 3,
    title: 'Перевірити роботу PWA',
    priority: 'Низький',
    done: true
  }
]

let initialTasks = defaultTasks

if (savedTasks) {
  try {
    initialTasks = JSON.parse(savedTasks)
  } catch (error) {
    initialTasks = defaultTasks
  }
}

export const tasks = ref(initialTasks)

watch(tasks, (newTasks) => {
  localStorage.setItem('taskflow-tasks', JSON.stringify(newTasks))
}, { deep: true })

export function addTask(title) {
  if (!title.trim()) return

  tasks.value.push({
    id: Date.now(),
    title: title.trim(),
    priority: 'Середній',
    done: false
  })
}
