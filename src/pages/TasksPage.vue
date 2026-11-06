
<script setup>
import '../css/task-list.css'
import { ref, computed } from 'vue'
import {
  f7Popup,
  f7Page,
  f7Navbar,
  f7NavRight,
  f7Link
} from 'framework7-vue'

import TaskCard from '../components/TaskCard.vue'
import TaskForm from '../components/TaskForm.vue'
import TaskListControls from '../components/TaskListControls.vue'

import { useTasksStore } from '../store/tasks.js'
import { useProjectsStore } from '../store/projects.js'

const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()

const statusFilter = ref('all')
const priorityFilter = ref('all')
const projectFilter = ref('all')
const sortOrder = ref('default')
const searchQuery = ref('')
const onlyIncomplete = ref(false)

const selectedTaskId = ref(null)
const formOpened = ref(false)
const editingTaskId = ref(null)
const formKey = ref(0)

// Фільтр зберігається безпосередньо в Pinia
const onlyWithoutDueDate = computed({
  get: () => tasksStore.filters.onlyWithoutDueDate,
  set: value => tasksStore.setOnlyWithoutDueDate(value)
})

const priorityValues = {
  high: 3,
  medium: 2,
  low: 1
}

const statusValues = {
  progress: 0,
  todo: 1,
  done: 2
}

// Використовуємо getter visibleTasks із Pinia
const filteredTasks = computed(() => {
  const query = searchQuery.value
    .trim()
    .toLocaleLowerCase('uk-UA')

  const result = tasksStore.visibleTasks.filter(task => {
    const matchesStatus =
      statusFilter.value === 'all' ||
      task.status === statusFilter.value

    const matchesPriority =
      priorityFilter.value === 'all' ||
      task.priority === priorityFilter.value

    const matchesProject =
      projectFilter.value === 'all' ||
      Number(task.projectId) === Number(projectFilter.value)

    const matchesIncomplete =
      !onlyIncomplete.value ||
      task.status !== 'done'

    const title = String(task.title ?? '')
      .toLocaleLowerCase('uk-UA')

    const description = String(task.description ?? '')
      .toLocaleLowerCase('uk-UA')

    const matchesSearch =
      title.includes(query) ||
      description.includes(query)

    return (
      matchesStatus &&
      matchesPriority &&
      matchesProject &&
      matchesSearch &&
      matchesIncomplete
    )
  })

  const compareTitle = (a, b) =>
    String(a.title ?? '').localeCompare(
      String(b.title ?? ''),
      'uk-UA'
    )

  const comparePriority = (a, b) =>
    (priorityValues[a.priority] ?? 0) -
    (priorityValues[b.priority] ?? 0)

  const compareStatus = (a, b) =>
    (statusValues[a.status] ?? 3) -
    (statusValues[b.status] ?? 3)

  function compareDate(a, b, descending = false) {
    const firstDate = String(a.dueDate ?? '').trim()
    const secondDate = String(b.dueDate ?? '').trim()

    if (!firstDate && !secondDate) return 0
    if (!firstDate) return 1
    if (!secondDate) return -1

    return descending
      ? secondDate.localeCompare(firstDate)
      : firstDate.localeCompare(secondDate)
  }

  switch (sortOrder.value) {
    case 'title-asc':
      result.sort(compareTitle)
      break

    case 'title-desc':
      result.sort((a, b) => compareTitle(b, a))
      break

    case 'priority-high':
      result.sort((a, b) => comparePriority(b, a))
      break

    case 'priority-low':
      result.sort(comparePriority)
      break

    case 'status':
    case 'status-order':
      result.sort(compareStatus)
      break

    case 'date-asc':
      result.sort((a, b) => compareDate(a, b))
      break

    case 'date-desc':
      result.sort((a, b) => compareDate(a, b, true))
      break

    default:
      break
  }

  return result
})

const selectedTask = computed(() =>
  tasksStore.getTaskById(selectedTaskId.value)
)

const editingTask = computed(() =>
  tasksStore.getTaskById(editingTaskId.value)
)

const completedCount = computed(() =>
  tasksStore.completedTasks
)

const completionPercent = computed(() =>
  tasksStore.completionPercent
)

function getProjectName(projectId) {
  return projectsStore.getProjectById(projectId)?.name ??
    'Проєкт не визначено'
}

function getProjectTaskCount(projectId) {
  return tasksStore.tasks.filter(
    task => Number(task.projectId) === Number(projectId)
  ).length
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

function openCreateForm() {
  editingTaskId.value = null
  formKey.value++
  formOpened.value = true
}

function openEditForm(id) {
  editingTaskId.value = id
  formKey.value++
  formOpened.value = true
}

function closeForm() {
  formOpened.value = false
}

function resetFilters() {
  statusFilter.value = 'all'
  priorityFilter.value = 'all'
  projectFilter.value = 'all'
  sortOrder.value = 'default'
  searchQuery.value = ''
  onlyIncomplete.value = false

  // Скидаємо також фільтр у Pinia
  tasksStore.setOnlyWithoutDueDate(false)
}

function handleSave(data) {
  const isEditing = editingTaskId.value !== null

  const result = isEditing
    ? tasksStore.updateTask(data)
    : tasksStore.addTask(data)

  if (result) {
    if (!isEditing) {
      resetFilters()
    }

    closeForm()
  } else {
    window.alert('Не вдалося зберегти завдання.')
  }
}

function handleDelete(id) {
  const task = tasksStore.getTaskById(id)

  if (!task) return

  const confirmed = window.confirm(
    `Видалити завдання «${task.title}»?\n\n` +
    'Цю дію не можна скасувати.'
  )

  if (!confirmed) return

  const removed = tasksStore.deleteTask(id)

  if (!removed) {
    window.alert('Не вдалося видалити завдання.')
    return
  }

  if (selectedTaskId.value === id) {
    closeTaskDetails()
  }

  if (editingTaskId.value === id) {
    closeForm()
    editingTaskId.value = null
  }
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
    <f7-navbar
      title="Усі завдання"
      back-link="Назад"
    />

    <div class="tasks-container">
      <div class="page-heading">
        <h1>Мої завдання</h1>

        <p>
          Переглядайте, створюйте та редагуйте завдання.
        </p>

        <button
          type="button"
          class="main-button"
          @click="openCreateForm"
        >
          + Додати завдання
        </button>
      </div>

      <section class="projects-section">
        <div class="section-heading">
          <h2>Мої проєкти</h2>

          <span>
            {{ projectsStore.totalProjects }} проєкти
          </span>
        </div>

        <div class="projects-grid">
          <button
            v-for="project in projectsStore.projects"
            :key="project.id"
            type="button"
            class="project-card"
            :class="{
              active:
                String(projectFilter) === String(project.id)
            }"
            @click="
              projectFilter =
                String(projectFilter) === String(project.id)
                  ? 'all'
                  : String(project.id)
            "
          >
            <strong>{{ project.name }}</strong>

            <span>{{ project.description }}</span>

            <small>
              Завдань: {{ getProjectTaskCount(project.id) }}
            </small>
          </button>
        </div>

        <p class="projects-hint">
          Натисніть на проєкт, щоб показати лише його
          завдання. Повторне натискання скасовує фільтр.
        </p>
      </section>

      <TaskListControls
        v-model:search="searchQuery"
        v-model:status="statusFilter"
        v-model:priority="priorityFilter"
        v-model:sort="sortOrder"
        v-model:onlyIncomplete="onlyIncomplete"
        :total="tasksStore.totalTasks"
        :found="filteredTasks.length"
        :completed="completedCount"
        @reset="resetFilters"
      />

      <!-- Новий фільтр із Pinia -->
      <section class="due-date-filter-section">
        <label class="due-date-filter-label">
          <input
            v-model="onlyWithoutDueDate"
            type="checkbox"
            class="due-date-checkbox"
          />

          <span class="due-date-filter-text">
            <strong>Лише без терміну</strong>

            <small>
              Показувати тільки завдання, для яких
              не встановлено дату завершення.
            </small>
          </span>
        </label>
      </section>

      <div class="progress-section">
        <div class="progress-heading">
          <strong>Прогрес виконання</strong>

          <span>
            {{ completedCount }} із {{ tasksStore.totalTasks }}
            — {{ completionPercent }}%
          </span>
        </div>

        <div
          class="progress-track"
          role="progressbar"
          :aria-valuenow="completionPercent"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Прогрес виконання завдань"
        >
          <div
            class="progress-fill"
            :style="{ width: `${completionPercent}%` }"
          ></div>
        </div>
      </div>

      <div
        v-if="filteredTasks.length"
        class="tasks-grid"
      >
        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="task-wrapper"
        >
          <TaskCard
            :task="task"
            :editable="true"
            :deletable="true"
            @status-change="handleStatusChange"
            @priority-change="handlePriorityChange"
            @task-select="handleTaskSelect"
            @edit="openEditForm"
            @delete="handleDelete"
          />
        </div>
      </div>

      <div v-else class="empty-state">
        <h3>Завдань не знайдено</h3>

        <p v-if="tasksStore.totalTasks">
          Спробуйте змінити параметри пошуку.
        </p>

        <p v-else>
          Список порожній. Створіть перше завдання.
        </p>

        <button
          v-if="tasksStore.totalTasks"
          type="button"
          class="main-button"
          @click="resetFilters"
        >
          Показати всі завдання
        </button>

        <button
          v-else
          type="button"
          class="main-button"
          @click="openCreateForm"
        >
          + Додати завдання
        </button>
      </div>
    </div>

    <f7Popup
      :opened="formOpened"
      @popup:closed="closeForm"
    >
      <f7Page>
        <f7Navbar
          :title="
            editingTaskId !== null
              ? 'Редагування'
              : 'Нове завдання'
          "
        >
          <f7NavRight>
            <f7Link popup-close>
              Закрити
            </f7Link>
          </f7NavRight>
        </f7Navbar>

        <div class="popup-content">
          <TaskForm
            :key="formKey"
            :task="editingTask"
            :existing-tasks="tasksStore.tasks"
            @save="handleSave"
            @cancel="closeForm"
          />
        </div>
      </f7Page>
    </f7Popup>

    <f7Popup
      :opened="selectedTaskId !== null"
      @popup:closed="closeTaskDetails"
    >
      <f7Page>
        <f7Navbar title="Інформація про завдання">
          <f7NavRight>
            <f7Link popup-close>
              Закрити
            </f7Link>
          </f7NavRight>
        </f7Navbar>

        <div
          v-if="selectedTask"
          class="details-container"
        >
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

.main-button {
  width: 100%;
  border: none;
  background: #7952b3;
  color: white;
  padding: 11px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.projects-section {
  margin: 24px 0;
  padding: 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.section-heading h2 {
  margin: 0;
  font-size: 18px;
  color: #26354d;
}

.section-heading span {
  font-size: 13px;
  color: #64748b;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.project-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 9px;
  text-align: left;
  padding: 15px;
  border: 1px solid #e2d9f0;
  border-radius: 10px;
  background: #f8f6fc;
  color: #26354d;
  cursor: pointer;
}

.project-card strong {
  font-size: 14px;
}

.project-card span {
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
}

.project-card small {
  margin-top: auto;
  color: #7952b3;
  font-weight: 600;
}

.project-card.active {
  border-color: #7952b3;
  background: #eee7f8;
  box-shadow: 0 0 0 1px #7952b3;
}

.project-card:hover {
  border-color: #7952b3;
}

.projects-hint {
  margin: 14px 0 0;
  font-size: 12px;
  color: #64748b;
}

/* Новий блок фільтра */
.due-date-filter-section {
  margin: 14px 0 22px;
  padding: 16px;
  background: #f8f6fc;
  border: 1px solid #e2d9f0;
  border-radius: 12px;
}

.due-date-filter-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
}

.due-date-checkbox {
  width: 17px;
  height: 17px;
  margin: 2px 0 0;
  flex-shrink: 0;
  accent-color: #7952b3;
  cursor: pointer;
}

.due-date-filter-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.due-date-filter-text strong {
  font-size: 14px;
  color: #26354d;
}

.due-date-filter-text small {
  font-size: 12px;
  line-height: 1.5;
  color: #64748b;
}

.due-date-checkbox:focus-visible {
  outline: 3px solid #7952b3;
  outline-offset: 3px;
}

/* Прогрес виконання */
.progress-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 24px;
}

.progress-heading {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
  color: #26354d;
  font-size: 14px;
}

.progress-track {
  height: 10px;
  background: #e2e8f0;
  border-radius: 20px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #7952b3;
  border-radius: 20px;
  transition: width 0.2s ease;
}

/* Картки завдань */
.tasks-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.task-wrapper {
  min-width: 0;
}

.empty-state {
  padding: 35px 20px;
  text-align: center;
  background: white;
  border-radius: 14px;
}

.empty-state p {
  color: #64748b;
}

.popup-content {
  padding: 16px;
}

.details-container {
  padding: 25px 20px;
}

.details-container h2 {
  color: #26354d;
}

.details-container p {
  color: #596579;
}

.detail-row {
  padding: 14px 0;
  border-bottom: 1px solid #e2e8f0;
}

@media (max-width: 740px) {
  .tasks-grid,
  .projects-grid {
    grid-template-columns: 1fr;
  }

  .tasks-container {
    padding: 16px 12px 100px;
  }

  .due-date-filter-section {
    padding: 14px;
  }
}
</style>
