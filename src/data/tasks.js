
import { ref, watch } from 'vue'

const STORAGE_KEY = 'taskflow-tasks'

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
  },
  {
    id: 4,
    title: 'Перевірити навігацію TaskFlow',
    priority: 'Високий',
    done: true
  },
  {
    id: 5,
    title: 'Оформити звіт із практичної',
    priority: 'Середній',
    done: false
  },
  {
    id: 6,
    title: 'Перевірити мобільну версію',
    priority: 'Низький',
    done: false
  }
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
    console.error('Помилка завантаження завдань:', error)
  }

  return defaultTasks
}

export const tasks = ref(loadTasks())

watch(tasks, (newTasks) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks))
}, { deep: true })

export function addTask(title) {
  const text = title.trim()

  if (!text) return

  tasks.value.push({
    id: crypto.randomUUID(),
    title: text,
    priority: 'Середній',
    done: false
  })
}
