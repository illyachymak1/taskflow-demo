
import { reactive, computed, watch } from 'vue'
import defaultTasks from '../data/tasks.js'

const STORAGE_KEY = 'taskflow-tasks-kp25'

const extraTasks = [
  {
    id: 7,
    title: 'Перевірити роботу компонентів',
    description: 'Перевірити відображення карток, статусів і пріоритетів.',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-11-01'
  },
  {
    id: 8,
    title: 'Протестувати фільтрацію',
    description: 'Перевірити пошук завдань за статусом і пріоритетом.',
    status: 'progress',
    priority: 'medium',
    dueDate: '2026-11-02'
  },
  {
    id: 9,
    title: 'Перевірити адаптивність',
    description: 'Перевірити вигляд TaskFlow на телефоні.',
    status: 'done',
    priority: 'low',
    dueDate: '2026-11-03'
  },
  {
    id: 10,
    title: 'Підготувати звіт',
    description: 'Додати скриншоти та пояснення виконаної роботи.',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-11-04'
  }
]

function loadTasks() {
  let savedTasks = []

  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved) {
      const parsed = JSON.parse(saved)

      if (Array.isArray(parsed)) {
        savedTasks = parsed
      }
    }
  } catch (error) {
    console.log('Не вдалося завантажити завдання')
  }

  const initialTasks = savedTasks.length
    ? savedTasks
    : defaultTasks.map(task => ({ ...task }))

  extraTasks.forEach(extraTask => {
    const exists = initialTasks.some(task => task.id === extraTask.id)

    if (!exists) {
      initialTasks.push({ ...extraTask })
    }
  })

  return initialTasks
}

export const state = reactive({
  tasks: loadTasks()
})

export const totalTasks = computed(() => {
  return state.tasks.length
})

export const completedTasks = computed(() => {
  return state.tasks.filter(task => task.status === 'done').length
})

export const pendingTasks = computed(() => {
  return state.tasks.filter(task => task.status !== 'done').length
})

export function changeStatus(id, status) {
  const allowedStatuses = ['todo', 'progress', 'done']

  if (!allowedStatuses.includes(status)) return

  const task = state.tasks.find(task => task.id === id)

  if (task) {
    task.status = status
  }
}

export function changePriority(id, priority) {
  const allowedPriorities = ['low', 'medium', 'high']

  if (!allowedPriorities.includes(priority)) return

  const task = state.tasks.find(task => task.id === id)

  if (task) {
    task.priority = priority
  }
}

export function addTask(title) {
  const text = title.trim()

  if (!text) return

  state.tasks.push({
    id: crypto.randomUUID(),
    title: text,
    description: 'Нове завдання',
    status: 'todo',
    priority: 'medium',
    dueDate: ''
  })
}

watch(
  () => state.tasks,
  (tasks) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  },
  { deep: true }
)
