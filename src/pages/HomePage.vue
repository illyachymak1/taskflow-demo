
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
import TaskCounter from '../components/TaskCounter.vue'

import { useTasksStore } from '../store/tasks.js'
import { useProjectsStore } from '../store/projects.js'

const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()

const selectedTaskId = ref(null)

const total = computed(() => tasksStore.totalTasks)
const completed = computed(() => tasksStore.completedTasks)
const inProgress = computed(() => tasksStore.progressTasks)
const planned = computed(() => tasksStore.plannedTasks)
const progressPercent = computed(() => tasksStore.completionPercent)

// Статистика проєктів із централізованого getter Pinia
const projectStats = computed(() => projectsStore.projectStats)

const activeTasks = computed(() => {
  const priorities = {
    high: 3,
    medium: 2,
    low: 1
  }

  return tasksStore.tasks
    .filter(task => task.status !== 'done')
    .sort(
      (a, b) =>
        (priorities[b.priority] ?? 0) -
        (priorities[a.priority] ?? 0)
    )
    .slice(0, 3)
})

const selectedTask = computed(() =>
  tasksStore.getTaskById(selectedTaskId.value)
)

function getProjectName(projectId) {
  return projectsStore.getProjectById(projectId)?.name ??
    'Проєкт не визначено'
}

function handleStatusChange(data) {
  tasksStore.changeStatus(data.id, data.status)
}

function handlePriorityChange(data) {
  tasksStore.changePriority(data.id, data.priority)
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

function formatDate(value) {
  if (!value) {
    return 'Без терміну'
  }

  const date = new Date(`${value}T12:00:00`)

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

      <!-- Статистика проєктів -->
      <div class="section-heading">
        <h2>Статистика проєктів</h2>
        <f7-link href="/projects/">Усі проєкти →</f7-link>
      </div>

      <div v-if="projectStats.length" class="projects-grid">
        <article
          v-for="project in projectStats"
          :key="project.id"
          class="project-card"
        >
          <div class="project-header">
            <h3>{{ project.name }}</h3>
            <span class="project-number">#{{ project.id }}</span>
          </div>

          <p class="project-description">
            {{ project.description || 'Опис відсутній.' }}
          </p>

          <div class="project-counters">
            <div class="project-counter">
              <span>Усього завдань</span>
              <strong>{{ project.total }}</strong>
            </div>

            <div class="project-counter">
              <span>Невиконано</span>
              <strong class="pending-count">
                {{ project.pending }}
              </strong>
            </div>

            <div class="project-counter">
              <span>Виконано</span>
              <strong>{{ project.completed }}</strong>
            </div>
          </div>

          <div class="project-progress-heading">
            <span>Прогрес виконання</span>
            <strong>{{ project.progress }}%</strong>
          </div>

          <div
            class="progress-bar project-progress-bar"
            role="progressbar"
            :aria-valuenow="project.progress"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="`Прогрес проєкту ${project.name}`"
          >
            <div
              class="progress-fill"
              :style="{ width: project.progress + '%' }"
            ></div>
          </div>
        </article>
      </div>

      <div v-else class="empty-message">
        Проєктів поки немає.
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
            <strong>Проєкт:</strong>
            {{ getProjectName(selectedTask.projectId) }}
          </div>

          <div class="detail-row">
            <strong>Термін:</strong>
            {{ formatDate(selectedTask.dueDate) }}
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

.section-heading h2 {
  margin-bottom: 15px;
}

.section-heading a {
  font-size: 14px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.project-card {
  min-width: 0;
  padding: 18px;
  background: #ffffff;
  border: 1px solid #e0e4ed;
  border-radius: 14px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.project-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.project-header h3 {
  margin: 0;
  font-size: 16px;
  color: #26354d;
  overflow-wrap: anywhere;
}

.project-number {
  flex-shrink: 0;
  padding: 5px 8px;
  border-radius: 7px;
  background: #f5f3fa;
  color: #7952b3;
  font-size: 12px;
}

.project-description {
  min-height: 38px;
  margin: 12px 0 16px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

.project-counters {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}

.project-counter {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 12px 10px;
  border-radius: 9px;
  background: #f8f7fc;
}

.project-counter span {
  font-size: 12px;
  color: #64748b;
}

.project-counter strong {
  color: #26354d;
  font-size: 22px;
}

.project-counter .pending-count {
  color: #7952b3;
}

.project-progress-heading {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 9px;
  font-size: 13px;
  color: #596579;
}

.project-progress-heading strong {
  color: #26354d;
}

.project-progress-bar {
  height: 10px;
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
  .statistics-grid,
  .projects-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tasks-grid {
    grid-template-columns: 1fr;
  }

  .home-container {
    padding: 16px 12px 100px;
  }
}

@media (max-width: 520px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }

  .project-counters {
    gap: 6px;
  }

  .project-counter {
    padding: 10px 7px;
  }

  .project-counter span {
    font-size: 11px;
  }

  .project-counter strong {
    font-size: 19px;
  }
}
</style>
