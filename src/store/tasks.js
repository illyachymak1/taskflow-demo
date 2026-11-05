
import { reactive, computed } from 'vue'
import defaultTasks from '../data/tasks.js'

const allowedStatuses = ['todo', 'progress', 'done']
const allowedPriorities = ['low', 'medium', 'high']
const allowedCategories = ['study', 'work', 'personal']

// Додаткові завдання з попередньої роботи
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

// Назва зі методички
export const taskState = state

// Реактивна статистика
export const totalTasks = computed(() => state.tasks.length)

export const completedTasks = computed(() =>
  state.tasks.filter(task => task.status === 'done').length
)

export const pendingTasks = computed(() =>
  state.tasks.filter(task => task.status !== 'done').length
)

// Пошук завдання
function findTask(id) {
  return state.tasks.find(task => task.id === Number(id))
}

// Перевірка дати
function validDate(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false
  }

  const date = new Date(`${value}T12:00:00`)

  if (Number.isNaN(date.getTime())) {
    return false
  }

  const formatted =
    date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0')

  return formatted === value
}

// Перевірка введених даних
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

  const category = allowedCategories.includes(data.category)
    ? data.category
    : 'study'

  return {
    title,
    description,
    status: data.status,
    priority: data.priority,
    dueDate: data.dueDate,
    category
  }
}

// Створення завдання
export function addTask(data) {
  const normalized = normalizeTaskData(data)

  if (!normalized) {
    return null
  }

  const nextId = state.tasks.reduce((maxId, task) =>
    Math.max(maxId, Number(task.id) || 0), 0
  ) + 1

  const newTask = {
    id: nextId,
    ...normalized
  }

  state.tasks.unshift(newTask)

  return newTask
}

// Редагування завдання
export function updateTask({ id, ...data }) {
  const normalized = normalizeTaskData(data)

  if (!normalized) {
    return null
  }

  const task = findTask(id)

  if (!task) {
    return null
  }

  Object.assign(task, normalized)

  return task
}

// Зміна статусу
export function changeStatus(id, status) {
  if (!allowedStatuses.includes(status)) {
    return false
  }

  const task = findTask(id)

  if (!task) {
    return false
  }

  task.status = status
  return true
}

// Зміна пріоритету
export function changePriority(id, priority) {
  if (!allowedPriorities.includes(priority)) {
    return false
  }

  const task = findTask(id)

  if (!task) {
    return false
  }

  task.priority = priority
  return true
}

// Сумісність із назвами функцій у методичці
export function setTaskStatus({ id, status }) {
  return changeStatus(id, status)
}

export function setTaskPriority({ id, priority }) {
  return changePriority(id, priority)
}

// Видалення завдання
export function deleteTask(id) {
  const index = state.tasks.findIndex(
    task => task.id === Number(id)
  )

  if (index === -1) {
    return false
  }

  state.tasks.splice(index, 1)

  return true
}
