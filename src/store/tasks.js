
import { defineStore } from 'pinia'
import defaultTasks from '../data/tasks.js'

const allowedStatuses = ['todo', 'progress', 'done']
const allowedPriorities = ['low', 'medium', 'high']
const allowedCategories = ['study', 'work', 'personal']

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

  // Дозволяємо створювати завдання без терміну
  if (
    data.dueDate !== null &&
    data.dueDate !== undefined &&
    data.dueDate !== '' &&
    !validDate(data.dueDate)
  ) {
    return null
  }

  const category = allowedCategories.includes(data.category)
    ? data.category
    : 'study'

  const projectId = Number(data.projectId)

  if (
    !Number.isInteger(projectId) ||
    projectId < 1
  ) {
    return null
  }

  return {
    title,
    description,
    status: data.status,
    priority: data.priority,
    dueDate: data.dueDate || null,
    category,
    projectId
  }
}

function prepareInitialTasks() {
  return [
    ...defaultTasks,
    ...extraTasks
  ].map(task => ({
    ...task,
    category: allowedCategories.includes(task.category)
      ? task.category
      : 'study',
    projectId: Number(task.projectId) || 1
  }))
}

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: prepareInitialTasks(),

    // Централізований стан фільтра
    filters: {
      onlyWithoutDueDate: false
    }
  }),

  getters: {
    totalTasks: state => state.tasks.length,

    completedTasks: state =>
      state.tasks.filter(
        task => task.status === 'done'
      ).length,

    pendingTasks: state =>
      state.tasks.filter(
        task => task.status !== 'done'
      ).length,

    progressTasks: state =>
      state.tasks.filter(
        task => task.status === 'progress'
      ).length,

    plannedTasks: state =>
      state.tasks.filter(
        task => task.status === 'todo'
      ).length,

    completionPercent() {
      return this.totalTasks
        ? Math.round(
            this.completedTasks / this.totalTasks * 100
          )
        : 0
    },

    // Getter для фільтрації завдань без терміну
    visibleTasks: state => {
      if (!state.filters.onlyWithoutDueDate) {
        return state.tasks
      }

      return state.tasks.filter(
        task => !task.dueDate
      )
    }
  },

  actions: {
    getTaskById(id) {
      return this.tasks.find(
        task => task.id === Number(id)
      ) ?? null
    },

    addTask(data) {
      const normalized = normalizeTaskData(data)

      if (!normalized) {
        return null
      }

      const nextId = this.tasks.reduce(
        (maxId, task) =>
          Math.max(maxId, Number(task.id) || 0),
        0
      ) + 1

      const newTask = {
        id: nextId,
        ...normalized
      }

      this.tasks.unshift(newTask)

      return newTask
    },

    updateTask({ id, ...data }) {
      const normalized = normalizeTaskData(data)

      if (!normalized) {
        return null
      }

      const task = this.getTaskById(id)

      if (!task) {
        return null
      }

      Object.assign(task, normalized)

      return task
    },

    changeStatus(id, status) {
      if (!allowedStatuses.includes(status)) {
        return false
      }

      const task = this.getTaskById(id)

      if (!task) {
        return false
      }

      task.status = status
      return true
    },

    changePriority(id, priority) {
      if (!allowedPriorities.includes(priority)) {
        return false
      }

      const task = this.getTaskById(id)

      if (!task) {
        return false
      }

      task.priority = priority
      return true
    },

    setTaskStatus({ id, status }) {
      return this.changeStatus(id, status)
    },

    setTaskPriority({ id, priority }) {
      return this.changePriority(id, priority)
    },

    // Групове переведення завдань проєкту в роботу
    startAllProjectTasks(projectId) {
      const id = Number(projectId)

      if (!Number.isInteger(id) || id < 1) {
        return 0
      }

      let changedCount = 0

      this.tasks.forEach(task => {
        if (
          Number(task.projectId) === id &&
          task.status !== 'progress'
        ) {
          task.status = 'progress'
          changedCount++
        }
      })

      return changedCount
    },

    // Керування фільтром без терміну
    setOnlyWithoutDueDate(value) {
      this.filters.onlyWithoutDueDate = Boolean(value)
    },

    deleteTask(id) {
      const index = this.tasks.findIndex(
        task => task.id === Number(id)
      )

      if (index === -1) {
        return false
      }

      this.tasks.splice(index, 1)

      return true
    }
  }
})
