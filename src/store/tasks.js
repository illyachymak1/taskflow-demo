
import { reactive, computed } from 'vue'
import defaultTasks from '../data/tasks.js'

const allowedStatuses = ['todo', 'progress', 'done']
const allowedPriorities = ['low', 'medium', 'high']

// Чотири завдання з попередньої практичної роботи
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

// Спільне реактивне сховище
export const state = reactive({
  tasks: [
    ...defaultTasks.map(task => ({ ...task })),
    ...extraTasks.map(task => ({ ...task }))
  ]
})

// Реактивна статистика
export const totalTasks = computed(() => state.tasks.length)

export const completedTasks = computed(() => {
  return state.tasks.filter(task => task.status === 'done').length
})

export const pendingTasks = computed(() => {
  return state.tasks.filter(task => task.status !== 'done').length
})

// Перевірка правильності дати
function validDate(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false
  }

  const date = new Date(value + 'T12:00:00')

  if (Number.isNaN(date.getTime())) {
    return false
  }

  const formatted =
    date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0')

  return formatted === value
}

// Перевірка та підготовка даних завдання
function normalizeTaskData(data) {
  if (!data || typeof data !== 'object') {
    return null
  }

  const title =
    typeof data.title === 'string'
      ? data.title.trim()
      : ''

  const description =
    typeof data.description === 'string'
      ? data.description.trim()
      : ''

  if (title.length < 3 || title.length > 80) {
    return null
  }

  if (description.length > 300) {
    return null
  }

  if (!allowedStatuses.includes(data.status)) {
    return null
  }

  if (!allowedPriorities.includes(data.priority)) {
    return null
  }

  if (!validDate(data.dueDate)) {
    return null
  }

  return {
    title,
    description,
    status: data.status,
    priority: data.priority,
    dueDate: data.dueDate
  }
}

// Створення нового завдання
export function addTask(data) {
  const normalized = normalizeTaskData(data)

  if (!normalized) {
    return null
  }

  const nextId = state.tasks.reduce((maxId, task) => {
    return Math.max(maxId, Number(task.id) || 0)
  }, 0) + 1

  const newTask = {
    id: nextId,
    ...normalized
  }

  state.tasks.push(newTask)

  return newTask
}

// Редагування наявного завдання
export function updateTask({ id, ...data }) {
  const normalized = normalizeTaskData(data)

  if (!normalized) {
    return null
  }

  const task = state.tasks.find(task => task.id === id)

  if (!task) {
    return null
  }

  Object.assign(task, normalized)

  return task
}

// Зміна статусу (залишаємо з попередньої роботи)
export function changeStatus(id, status) {
  if (!allowedStatuses.includes(status)) {
    return
  }

  const task = state.tasks.find(task => task.id === id)

  if (task) {
    task.status = status
  }
}

// Зміна пріоритету (залишаємо з попередньої роботи)
export function changePriority(id, priority) {
  if (!allowedPriorities.includes(priority)) {
    return
  }

  const task = state.tasks.find(task => task.id === id)

  if (task) {
    task.priority = priority
  }
}
