
<script setup>
import { ref, computed } from 'vue'
import {
  f7Page,
  f7Navbar,
  f7Popup,
  f7NavRight,
  f7Link
} from 'framework7-vue'

import { useProjectsStore } from '../store/projects.js'
import { useTasksStore } from '../store/tasks.js'

const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()

const formOpened = ref(false)
const editingProjectId = ref(null)

const projectName = ref('')
const projectDescription = ref('')
const formError = ref('')

const totalProjects = computed(() =>
  projectsStore.totalProjects
)

const totalTasks = computed(() =>
  tasksStore.totalTasks
)

const completedTasks = computed(() =>
  tasksStore.completedTasks
)

const isEditing = computed(() =>
  editingProjectId.value !== null
)

function getProjectTasks(projectId) {
  return tasksStore.tasks.filter(
    task => Number(task.projectId) === Number(projectId)
  )
}

function getProjectTaskCount(projectId) {
  return getProjectTasks(projectId).length
}

function getProjectCompletedCount(projectId) {
  return getProjectTasks(projectId).filter(
    task => task.status === 'done'
  ).length
}

function getProjectProgress(projectId) {
  const total = getProjectTaskCount(projectId)

  if (total === 0) {
    return 0
  }

  return Math.round(
    getProjectCompletedCount(projectId) / total * 100
  )
}

function openCreateForm() {
  editingProjectId.value = null
  projectName.value = ''
  projectDescription.value = ''
  formError.value = ''
  formOpened.value = true
}

function openEditForm(project) {
  editingProjectId.value = project.id
  projectName.value = project.name
  projectDescription.value = project.description ?? ''
  formError.value = ''
  formOpened.value = true
}

function closeForm() {
  formOpened.value = false
}

function saveProject() {
  const name = projectName.value.trim()
  const description = projectDescription.value.trim()

  formError.value = ''

  if (name.length < 3 || name.length > 80) {
    formError.value =
      'Назва повинна містити від 3 до 80 символів.'
    return
  }

  if (description.length > 300) {
    formError.value =
      'Опис не може перевищувати 300 символів.'
    return
  }

  const duplicate = projectsStore.projects.some(project =>
    project.id !== editingProjectId.value &&
    project.name.trim().toLocaleLowerCase('uk-UA') ===
      name.toLocaleLowerCase('uk-UA')
  )

  if (duplicate) {
    formError.value =
      'Проєкт із такою назвою вже існує.'
    return
  }

  const data = {
    name,
    description
  }

  const result = isEditing.value
    ? projectsStore.updateProject(editingProjectId.value, data)
    : projectsStore.addProject(data)

  if (!result) {
    formError.value = 'Не вдалося зберегти проєкт.'
    return
  }

  closeForm()
}

function deleteProject(project) {
  const taskCount = getProjectTaskCount(project.id)

  if (taskCount > 0) {
    window.alert(
      `Не можна видалити проєкт «${project.name}», ` +
      `оскільки він містить ${taskCount} завдань.\n\n` +
      'Спочатку перенесіть або видаліть ці завдання.'
    )
    return
  }

  const confirmed = window.confirm(
    `Видалити проєкт «${project.name}»?\n\n` +
    'Цю дію не можна скасувати.'
  )

  if (!confirmed) {
    return
  }

  const removed = projectsStore.deleteProject(project.id)

  if (!removed) {
    window.alert('Не вдалося видалити проєкт.')
  }
}
</script>

<template>
  <f7-page name="projects">
    <f7-navbar
      title="Мої проєкти"
      back-link="Назад"
    />

    <div class="projects-container">
      <div class="page-heading">
        <h1>Мої проєкти</h1>

        <p>
          Створюйте проєкти, керуйте ними та
          відстежуйте виконання завдань.
        </p>

        <button
          type="button"
          class="main-button"
          @click="openCreateForm"
        >
          + Створити проєкт
        </button>
      </div>

      <div class="statistics-grid">
        <div class="stat-card">
          <span>Усього проєктів</span>
          <strong>{{ totalProjects }}</strong>
        </div>

        <div class="stat-card">
          <span>Усього завдань</span>
          <strong>{{ totalTasks }}</strong>
        </div>

        <div class="stat-card">
          <span>Виконано завдань</span>
          <strong>{{ completedTasks }}</strong>
        </div>
      </div>

      <div
        v-if="projectsStore.projects.length"
        class="projects-grid"
      >
        <article
          v-for="project in projectsStore.projects"
          :key="project.id"
          class="project-card"
        >
          <div class="project-heading">
            <h2>{{ project.name }}</h2>

            <span class="project-id">
              #{{ project.id }}
            </span>
          </div>

          <p class="project-description">
            {{ project.description || 'Опис відсутній.' }}
          </p>

          <div class="project-statistics">
            <span>
              Усього завдань:
              <strong>
                {{ getProjectTaskCount(project.id) }}
              </strong>
            </span>

            <span>
              Виконано:
              <strong>
                {{ getProjectCompletedCount(project.id) }}
              </strong>
            </span>
          </div>

          <div class="progress-heading">
            <span>Прогрес виконання</span>

            <strong>
              {{ getProjectProgress(project.id) }}%
            </strong>
          </div>

          <div
            class="progress-track"
            role="progressbar"
            :aria-valuenow="getProjectProgress(project.id)"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="
              `Прогрес проєкту ${project.name}`
            "
          >
            <div
              class="progress-fill"
              :style="{
                width: getProjectProgress(project.id) + '%'
              }"
            ></div>
          </div>

          <div class="project-actions">
            <button
              type="button"
              class="edit-button"
              @click="openEditForm(project)"
            >
              Редагувати
            </button>

            <button
              type="button"
              class="delete-button"
              @click="deleteProject(project)"
            >
              Видалити
            </button>
          </div>
        </article>
      </div>

      <div v-else class="empty-state">
        <h2>Проєктів поки немає</h2>
        <p>Створіть свій перший проєкт.</p>

        <button
          type="button"
          class="main-button"
          @click="openCreateForm"
        >
          + Створити проєкт
        </button>
      </div>

      <div class="navigation-section">
        <h2>Керування завданнями</h2>

        <p>
          Призначайте завдання проєктам і переглядайте
          їх виконання на сторінці завдань.
        </p>

        <f7-link href="/tasks/" class="tasks-link">
          Перейти до завдань →
        </f7-link>
      </div>
    </div>

    <f7-popup
      :opened="formOpened"
      @popup:closed="closeForm"
    >
      <f7-page>
        <f7-navbar
          :title="
            isEditing
              ? 'Редагування проєкту'
              : 'Новий проєкт'
          "
        >
          <f7-nav-right>
            <f7-link popup-close>
              Закрити
            </f7-link>
          </f7-nav-right>
        </f7-navbar>

        <form
          class="project-form"
          novalidate
          @submit.prevent="saveProject"
        >
          <h2>
            {{ isEditing ? 'Редагувати проєкт' : 'Створити проєкт' }}
          </h2>

          <div class="form-group">
            <label for="project-name">
              Назва проєкту *
            </label>

            <input
              id="project-name"
              v-model="projectName"
              type="text"
              maxlength="80"
              placeholder="Введіть назву проєкту"
              required
            />

            <small>
              Залишилося символів:
              {{ 80 - projectName.length }}
            </small>
          </div>

          <div class="form-group">
            <label for="project-description">
              Опис проєкту
            </label>

            <textarea
              id="project-description"
              v-model="projectDescription"
              rows="4"
              maxlength="300"
              placeholder="Введіть опис проєкту"
            ></textarea>

            <small>
              Залишилося символів:
              {{ 300 - projectDescription.length }}
            </small>
          </div>

          <p
            v-if="formError"
            class="error"
            role="alert"
          >
            {{ formError }}
          </p>

          <div class="form-actions">
            <button type="submit" class="main-button">
              {{ isEditing ? 'Зберегти зміни' : 'Створити проєкт' }}
            </button>

            <button
              type="button"
              class="secondary-button"
              @click="closeForm"
            >
              Скасувати
            </button>
          </div>
        </form>
      </f7-page>
    </f7-popup>
  </f7-page>
</template>

<style scoped>
.projects-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 16px 100px;
}

.page-heading {
  margin-bottom: 24px;
}

.page-heading h1 {
  font-size: 26px;
  margin-bottom: 8px;
  color: #26354d;
}

.page-heading p,
.navigation-section p {
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}

.main-button {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background: #7952b3;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.stat-card span {
  font-size: 13px;
  color: #64748b;
}

.stat-card strong {
  font-size: 28px;
  color: #7952b3;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.project-card {
  padding: 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}

.project-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.project-heading h2 {
  margin: 0;
  font-size: 18px;
  color: #26354d;
}

.project-id {
  padding: 5px 9px;
  border-radius: 8px;
  background: #f5f3fa;
  color: #7952b3;
  font-size: 12px;
}

.project-description {
  min-height: 42px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}

.project-statistics {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin: 20px 0;
  font-size: 13px;
  color: #64748b;
}

.project-statistics strong {
  color: #26354d;
}

.progress-heading {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 13px;
  color: #26354d;
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

.project-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.project-actions button {
  flex: 1;
  padding: 11px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
}

.edit-button {
  border: 1px solid #7952b3;
  background: #f5f3fa;
  color: #7952b3;
}

.delete-button {
  border: 1px solid #fecaca;
  background: #fff7f7;
  color: #dc2626;
}

.empty-state {
  padding: 35px 20px;
  background: white;
  border-radius: 14px;
  text-align: center;
}

.empty-state p {
  color: #64748b;
}

.navigation-section {
  margin-top: 26px;
  padding: 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}

.navigation-section h2 {
  margin-top: 0;
  font-size: 18px;
  color: #26354d;
}

.tasks-link {
  display: inline-block;
  color: #7952b3;
  font-weight: 600;
}

.project-form {
  padding: 22px;
  color: #26354d;
}

.project-form h2 {
  margin: 0 0 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
}

.form-group input,
.form-group textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: white;
  color: #26354d;
  font: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: 2px solid #7952b3;
  outline-offset: 1px;
}

.form-group small {
  font-size: 12px;
  color: #64748b;
}

.error {
  color: #dc2626;
  font-size: 13px;
}

.form-actions {
  display: flex;
  gap: 12px;
}

.form-actions .main-button,
.secondary-button {
  flex: 1;
}

.secondary-button {
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f1f3f8;
  color: #26354d;
  cursor: pointer;
}

@media (max-width: 740px) {
  .statistics-grid {
    grid-template-columns: 1fr;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }

  .projects-container {
    padding: 16px 12px 100px;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
