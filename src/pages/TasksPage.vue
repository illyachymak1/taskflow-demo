
<script setup>
import { ref, computed } from 'vue'
import {
  f7Popup,
  f7Page,
  f7Navbar,
  f7NavRight,
  f7Link
} from 'framework7-vue'

import TaskCard from '../components/TaskCard.vue'

import {
  state,
  changeStatus,
  changePriority
} from '../store/tasks.js'

const statusFilter = ref('all')
const priorityFilter = ref('all')
const sortOrder = ref('default')
const selectedTaskId = ref(null)

const priorityValues = {
  high: 3,
  medium: 2,
  low: 1
}

const filteredTasks = computed(() => {
  const result = state.tasks.filter(task => {
    const matchesStatus =
      statusFilter.value === 'all' ||
      task.status === statusFilter.value

    const matchesPriority =
      priorityFilter.value === 'all' ||
      task.priority === priorityFilter.value

    return matchesStatus && matchesPriority
  })

  if (sortOrder.value === 'high') {
    result.sort((a, b) => {
      return priorityValues[b.priority] - priorityValues[a.priority]
    })
  }

  if (sortOrder.value === 'low') {
    result.sort((a, b) => {
      return priorityValues[a.priority] - priorityValues[b.priority]
    })
  }

  return result
})

const selectedTask = computed(() => {
  return state.tasks.find(task => task.id === selectedTaskId.value)
})

function handleStatusChange(data) {
  changeStatus(data.id, data.status)
}

function handlePriorityChange(data) {
  changePriority(data.id, data.priority)
}

function handleTaskSelect(id) {
  selectedTaskId.value = id
}

function closeTaskDetails() {
  selectedTaskId.value = null
}

function resetFilters() {
  statusFilter.value = 'all'
  priorityFilter.value = 'all'
  sortOrder.value = 'default'
}

function statusName(status) {
  if (status === 'done') return 'Виконано'
  if (status === 'progress') return 'У роботі'
  return 'Заплановано'
}

function priorityName(priority) {
  if (priority === 'high') return 'Високий'
  if (priority === 'medium') return 'Середній'
  return 'Низький'
}

function formatDate(value) {
  if (!value) return 'Без терміну'

  const date = new Date(value + 'T12:00:00')

  if (Number.isNaN(date.getTime())) {
    return 'Дата не визначена'
  }

  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date)
}
</script>

<template>
  <f7-page name="tasks">
    <f7-navbar title="Усі завдання" back-link="Назад" />

    <div class="tasks-container">

      <div class="page-heading">
        <h1>Мої завдання</h1>
        <p>
          Переглядайте завдання, змінюйте їхній статус
          і пріоритет.
        </p>
      </div>

      <div class="filters-section">
        <h2>Фільтрація та сортування</h2>

        <div class="filters-grid">

          <div class="filter-group">
            <label for="status-filter">Статус</label>

            <select
              id="status-filter"
              v-model="statusFilter"
            >
              <option value="all">Усі статуси</option>
              <option value="todo">Заплановано</option>
              <option value="progress">У роботі</option>
              <option value="done">Виконано</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="priority-filter">Пріоритет</label>

            <select
              id="priority-filter"
              v-model="priorityFilter"
            >
              <option value="all">Усі пріоритети</option>
              <option value="high">Високий</option>
              <option value="medium">Середній</option>
              <option value="low">Низький</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="sort-order">Сортування</label>

            <select
              id="sort-order"
              v-model="sortOrder"
            >
              <option value="default">За порядком додавання</option>
              <option value="high">Від високого пріоритету</option>
              <option value="low">Від низького пріоритету</option>
            </select>
          </div>

        </div>

        <div class="filter-bottom">
          <span>
            Знайдено завдань: {{ filteredTasks.length }}
          </span>

          <button
            type="button"
            class="reset-button"
            @click="resetFilters"
          >
            Скинути фільтри
          </button>
        </div>
      </div>

      <div v-if="filteredTasks.length" class="tasks-grid">
        <TaskCard
          v-for="task in filteredTasks"
          :key="task.id"
          :task="task"
          @status-change="handleStatusChange"
          @priority-change="handlePriorityChange"
          @task-select="handleTaskSelect"
        />
      </div>

      <div v-else class="empty-state">
        <h3>Завдань не знайдено</h3>

        <p>
          Спробуйте вибрати інший статус або пріоритет.
        </p>

        <button
          type="button"
          class="reset-button"
          @click="resetFilters"
        >
          Показати всі завдання
        </button>
      </div>

    </div>

    <f7Popup
      :opened="selectedTaskId !== null"
      @popup:closed="closeTaskDetails"
    >
      <f7Page>
        <f7Navbar title="Інформація про завдання">
          <f7NavRight>
            <f7Link popup-close>Закрити</f7Link>
          </f7NavRight>
        </f7Navbar>

        <div v-if="selectedTask" class="details-container">
          <h2>{{ selectedTask.title }}</h2>

          <p>{{ selectedTask.description }}</p>

          <div class="detail-row">
            <strong>Статус:</strong>
            {{ statusName(selectedTask.status) }}
          </div>

          <div class="detail-row">
            <strong>Пріоритет:</strong>
            {{ priorityName(selectedTask.priority) }}
          </div>

          <div class="detail-row">
            <strong>Термін:</strong>
            {{ formatDate(selectedTask.dueDate) }}
          </div>
        </div>
      </f7Page>
    </f7Popup>

  </f7-page>
</template>

<style scoped>
.tasks-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 16px 100px;
}

.page-heading h1 {
  font-size: 26px;
  margin-bottom: 8px;
}

.page-heading p {
  color: #64748b;
  font-size: 14px;
}

.filters-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px;
  margin: 24px 0;
}

.filters-section h2 {
  font-size: 18px;
  margin: 0 0 16px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.filter-group select {
  width: 100%;
  min-width: 0;
  padding: 11px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #334155;
  font-size: 14px;
}

.filter-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
  font-size: 13px;
  color: #64748b;
}

.reset-button {
  border: none;
  background: #7952b3;
  color: #ffffff;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
}

.reset-button:hover {
  opacity: 0.85;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.empty-state {
  padding: 35px 20px;
  text-align: center;
  background: #ffffff;
  border-radius: 14px;
}

.empty-state h3 {
  font-size: 18px;
  color: #334155;
}

.empty-state p {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 18px;
}

.details-container {
  padding: 25px 20px;
}

.details-container h2 {
  color: #26354d;
  margin-top: 0;
}

.details-container p {
  color: #596579;
  line-height: 1.6;
}

.detail-row {
  padding: 14px 0;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
}

.detail-row strong {
  margin-right: 8px;
}

.reset-button:focus-visible,
.filter-group select:focus-visible {
  outline: 3px solid #7952b3;
  outline-offset: 2px;
}

@media (max-width: 740px) {
  .tasks-grid,
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .tasks-container {
    padding: 16px 12px 100px;
  }
}
</style>
