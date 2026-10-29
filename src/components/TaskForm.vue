
<script setup>
import { reactive, computed, watch, ref } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    default: null
  },
  existingTasks: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['save', 'cancel'])

const form = reactive({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
  category: 'study'
})

const errors = reactive({})
const submitted = ref(false)

const isEditing = computed(() => Boolean(props.task))

const titleRemaining = computed(() => 80 - form.title.length)
const descriptionRemaining = computed(() => 300 - form.description.length)

function getToday() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const today = computed(() => getToday())

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const date = new Date(`${value}T12:00:00`)

  if (Number.isNaN(date.getTime())) {
    return false
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}` === value
}

function validateDate() {
  delete errors.dueDate

  if (!form.dueDate) {
    errors.dueDate = 'Вкажіть дату завершення.'
    return false
  }

  if (!isValidDate(form.dueDate)) {
    errors.dueDate = 'Введіть правильну дату.'
    return false
  }

  if (!isEditing.value && form.dueDate < getToday()) {
    errors.dueDate = 'Дата не може бути в минулому.'
    return false
  }

  return true
}

function clearErrors() {
  Object.keys(errors).forEach(key => delete errors[key])
  submitted.value = false
}

function fillForm(task) {
  form.title = task?.title ?? ''
  form.description = task?.description ?? ''
  form.status = task?.status ?? 'todo'
  form.priority = task?.priority ?? 'medium'
  form.dueDate = task?.dueDate ?? ''
  form.category = task?.category ?? 'study'

  clearErrors()
}

watch(() => props.task, fillForm, { immediate: true })

// Перевіряємо дату відразу після її зміни
watch(() => form.dueDate, () => {
  if (form.dueDate || submitted.value) {
    validateDate()
  } else {
    delete errors.dueDate
  }
})

const dateHasError = computed(() => Boolean(errors.dueDate))

function validate() {
  Object.keys(errors).forEach(key => delete errors[key])

  const title = form.title.trim()

  if (title.length < 3 || title.length > 80) {
    errors.title = 'Назва повинна містити від 3 до 80 символів.'
  }

  const duplicate = props.existingTasks.some(task =>
    task.id !== props.task?.id &&
    task.title.trim().toLowerCase() === title.toLowerCase()
  )

  if (title && duplicate) {
    errors.title = 'Завдання з такою назвою вже існує.'
  }

  if (form.description.length > 300) {
    errors.description = 'Максимум 300 символів.'
  }

  if (!['todo', 'progress', 'done'].includes(form.status)) {
    errors.status = 'Виберіть статус.'
  }

  if (!['low', 'medium', 'high'].includes(form.priority)) {
    errors.priority = 'Виберіть пріоритет.'
  }

  if (!['study', 'work', 'personal'].includes(form.category)) {
    errors.category = 'Виберіть категорію.'
  }

  validateDate()

  return Object.keys(errors).length === 0
}

function saveTask() {
  submitted.value = true

  if (!validate()) {
    return
  }

  emit('save', {
    ...(isEditing.value ? { id: props.task.id } : {}),
    title: form.title.trim(),
    description: form.description.trim(),
    status: form.status,
    priority: form.priority,
    dueDate: form.dueDate,
    category: form.category
  })
}

function resetForm() {
  if (isEditing.value) {
    fillForm(props.task)
  } else {
    fillForm(null)
  }
}

function cancelForm() {
  emit('cancel')
}

const statusLabels = {
  todo: 'Заплановано',
  progress: 'У роботі',
  done: 'Виконано'
}

const priorityLabels = {
  low: 'Низький',
  medium: 'Середній',
  high: 'Високий'
}

const categoryLabels = {
  study: 'Навчання',
  work: 'Робота',
  personal: 'Особисте'
}
</script>

<template>
  <form class="task-form" novalidate @submit.prevent="saveTask">
    <h2>
      {{ isEditing ? 'Редагувати завдання' : 'Нове завдання' }}
    </h2>

    <p class="required-note">* Обов'язкові поля</p>

    <div class="form-group">
      <label for="task-title">Назва *</label>

      <input
        id="task-title"
        v-model="form.title"
        type="text"
        maxlength="80"
        :aria-invalid="Boolean(errors.title)"
        :aria-describedby="errors.title ? 'title-error' : undefined"
        placeholder="Введіть назву"
      />

      <small>
        Залишилося символів: {{ titleRemaining }}
      </small>

      <span
        v-if="errors.title"
        id="title-error"
        class="error"
      >
        {{ errors.title }}
      </span>
    </div>

    <div class="form-group">
      <label for="task-description">Опис</label>

      <textarea
        id="task-description"
        v-model="form.description"
        maxlength="300"
        rows="3"
        placeholder="Введіть опис"
      ></textarea>

      <small>
        Залишилося символів: {{ descriptionRemaining }}
      </small>

      <span v-if="errors.description" class="error">
        {{ errors.description }}
      </span>
    </div>

    <div class="form-grid">
      <div class="form-group">
        <label for="task-status">Статус *</label>

        <select id="task-status" v-model="form.status">
          <option value="todo">Заплановано</option>
          <option value="progress">У роботі</option>
          <option value="done">Виконано</option>
        </select>

        <span v-if="errors.status" class="error">
          {{ errors.status }}
        </span>
      </div>

      <div class="form-group">
        <label for="task-priority">Пріоритет *</label>

        <select id="task-priority" v-model="form.priority">
          <option value="low">Низький</option>
          <option value="medium">Середній</option>
          <option value="high">Високий</option>
        </select>

        <span v-if="errors.priority" class="error">
          {{ errors.priority }}
        </span>
      </div>

      <div class="form-group">
        <label for="task-date">Дата завершення *</label>

        <input
          id="task-date"
          v-model="form.dueDate"
          type="date"
          :min="isEditing ? undefined : today"
          :class="{ 'input-error': dateHasError }"
          :aria-invalid="dateHasError"
          :aria-describedby="dateHasError ? 'date-error' : undefined"
          @change="validateDate"
        />

        <span
          v-if="errors.dueDate"
          id="date-error"
          class="error"
          role="alert"
        >
          {{ errors.dueDate }}
        </span>
      </div>

      <div class="form-group">
        <label for="task-category">Категорія</label>

        <select id="task-category" v-model="form.category">
          <option value="study">Навчання</option>
          <option value="work">Робота</option>
          <option value="personal">Особисте</option>
        </select>

        <span v-if="errors.category" class="error">
          {{ errors.category }}
        </span>
      </div>
    </div>

    <div class="preview">
      <h3>Попередній перегляд</h3>

      <strong>
        {{ form.title || 'Назва завдання' }}
      </strong>

      <p>
        {{ form.description || 'Опис завдання' }}
      </p>

      <p>
        Статус: {{ statusLabels[form.status] }}
      </p>

      <p>
        Пріоритет: {{ priorityLabels[form.priority] }}
      </p>

      <p>
        Категорія: {{ categoryLabels[form.category] }}
      </p>

      <p>
        Термін: {{ form.dueDate || 'Не вказано' }}
      </p>

      <p v-if="dateHasError" class="error">
        {{ errors.dueDate }}
      </p>
    </div>

    <div class="form-actions">
      <button
        type="submit"
        class="primary"
      >
        {{ isEditing ? 'Зберегти зміни' : 'Створити завдання' }}
      </button>

      <button
        type="button"
        @click="resetForm"
      >
        Очистити форму
      </button>

      <button
        type="button"
        @click="cancelForm"
      >
        Скасувати
      </button>
    </div>
  </form>
</template>

<style scoped>
.task-form {
  padding: 20px;
  background: white;
  border-radius: 14px;
  color: #26354d;
}

.task-form h2 {
  margin: 0 0 10px;
}

.required-note {
  color: #64748b;
  font-size: 13px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 16px;
}

.form-group label {
  font-weight: 600;
  font-size: 14px;
}

.form-group input,
.form-group textarea,
.form-group select {
  box-sizing: border-box;
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 11px;
  font: inherit;
  background: white;
  color: #26354d;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: 2px solid #7952b3;
  outline-offset: 1px;
}

.form-group small {
  color: #64748b;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 14px;
}

.error {
  color: #dc2626;
  font-size: 13px;
}

.form-group .input-error {
  border: 2px solid #dc2626;
  background: #fff7f7;
}

.preview {
  padding: 16px;
  margin: 15px 0;
  border-radius: 10px;
  background: #f5f3fa;
  border: 1px solid #e2d9f0;
}

.preview h3 {
  margin-top: 0;
}

.preview p {
  margin: 7px 0;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.form-actions button {
  padding: 11px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  background: #f1f3f8;
  color: #26354d;
}

.form-actions .primary {
  background: #7952b3;
  color: white;
  border-color: #7952b3;
}

.form-actions button:hover {
  opacity: 0.9;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
