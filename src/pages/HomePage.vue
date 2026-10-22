
<script setup>
import { ref, computed } from 'vue'
import { f7Popup, f7Page, f7Navbar, f7NavRight, f7Link } from 'framework7-vue'
import TaskCard from '../components/TaskCard.vue'
import TaskCounter from '../components/TaskCounter.vue'

import {
  state,
  changeStatus,
  changePriority
} from '../store/tasks.js'

const selectedTaskId = ref(null)

const total = computed(() => state.tasks.length)

const completed = computed(() => {
  return state.tasks.filter(task => task.status === 'done').length
})

const inProgress = computed(() => {
  return state.tasks.filter(task => task.status === 'progress').length
})

const planned = computed(() => {
  return state.tasks.filter(task => task.status === 'todo').length
})

const progressPercent = computed(() => {
  if (total.value === 0) return 0

  return Math.round(completed.value / total.value * 100)
})

const activeTasks = computed(() => {
  const priorities = {
    high: 3,
    medium: 2,
    low: 1
  }

  return state.tasks
    .filter(task => task.status !== 'done')
    .sort((a, b) => priorities[b.priority] - priorities[a.priority])
    .slice(0, 3)
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
</script>

<template>
  <f7-page name="home">
    <f7-navbar title="TaskFlow" />

    <div class="home-container">
      <div class="welcome-block">
        <h1>Головна сторінка</h1>
        <p>
          Керуйте своїми завданнями та відстежуйте
          їх виконання.
        </p>
      </div>

      <h2>Статистика завдань</h2>

      <div class="statistics-grid">
        <TaskCounter :count="total" label="Усього" />
        <TaskCounter :count="completed" label="Виконано" />
        <TaskCounter :count="inProgress" label="У роботі" />
        <TaskCounter :count="planned" label="Заплановано" />
      </div>

      <div class="progress-section">
        <h2>Прогрес виконання</h2>

        <div
          class="progress-bar"
          role="progressbar"
          :aria-valuenow="progressPercent"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Прогрес виконання завдань"
        >
          <div
            class="progress-fill"
            :style="{ width: progressPercent + '%' }"
          ></div>
        </div>

        <p>Виконано {{ progressPercent }}% завдань</p>
      </div>

      <div class="section-heading">
        <h2>Актуальні завдання</h2>
        <f7-link href="/tasks/">Усі завдання →</f7-link>
      </div>

      <div v-if="activeTasks.length" class="tasks-grid">
        <TaskCard
          v-for="task in activeTasks"
          :key="task.id"
          :task="task"
          @status-change="handleStatusChange"
          @priority-change="handlePriorityChange"
          @task-select="handleTaskSelect"
        />
      </div>

      <div v-else class="empty-message">
        Усі завдання виконано!
      </div>
    </div>

    <f7-popup
      :opened="selectedTaskId !== null"
      @popup:closed="closeTaskDetails"
    >
      <f7-page>
        <f7-navbar title="Інформація про завдання">
          <f7-nav-right>
            <f7-link popup-close>Закрити</f7-link>
          </f7-nav-right>
        </f7-navbar>

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
            {{ selectedTask.dueDate || 'Без терміну' }}
          </div>
        </div>
      </f7-page>
    </f7-popup>
  </f7-page>
</template>

<style scoped>
.home-container {
  padding: 20px 16px 100px;
  max-width: 1100px;
  margin: 0 auto;
}

.welcome-block {
  margin-bottom: 28px;
}

.welcome-block h1 {
  font-size: 26px;
  margin-bottom: 8px;
}

.welcome-block p {
  color: #64748b;
  font-size: 14px;
}

h2 {
  font-size: 19px;
  margin: 22px 0 15px;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.progress-section {
  margin-top: 26px;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #7952b3;
  border-radius: 10px;
  transition: width 0.3s;
}

.progress-section p {
  font-size: 13px;
  color: #64748b;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 25px;
}

.section-heading a {
  font-size: 14px;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.empty-message {
  text-align: center;
  padding: 30px;
  color: #64748b;
  background: #ffffff;
  border-radius: 12px;
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

@media (max-width: 740px) {
  .statistics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tasks-grid {
    grid-template-columns: 1fr;
  }

  .home-container {
    padding: 16px 12px 100px;
  }
}
</style>
