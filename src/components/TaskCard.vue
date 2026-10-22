
<script setup>
import { computed } from 'vue'
import StatusBadge from './StatusBadge.vue'
import PriorityBadge from './PriorityBadge.vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  'status-change',
  'priority-change',
  'task-select'
])

const statusSequence = ['todo', 'progress', 'done']
const prioritySequence = ['low', 'medium', 'high']

const statusActionText = computed(() => {
  if (props.task.status === 'todo') {
    return 'Взяти в роботу'
  }

  if (props.task.status === 'progress') {
    return 'Завершити'
  }

  return 'Повернути в план'
})

const formattedDate = computed(() => {
  if (!props.task.dueDate) {
    return 'Без терміну'
  }

  const date = new Date(props.task.dueDate + 'T12:00:00')

  if (Number.isNaN(date.getTime())) {
    return 'Дата не визначена'
  }

  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date)
})

function changeStatus() {
  const index = statusSequence.indexOf(props.task.status)

  const newStatus =
    statusSequence[(index + 1) % statusSequence.length]

  emit('status-change', {
    id: props.task.id,
    status: newStatus
  })
}

function changePriority() {
  const index = prioritySequence.indexOf(props.task.priority)

  const newPriority =
    prioritySequence[(index + 1) % prioritySequence.length]

  emit('priority-change', {
    id: props.task.id,
    priority: newPriority
  })
}

function selectTask() {
  emit('task-select', props.task.id)
}
</script>

<template>
  <div class="task-card">

    <div class="card-header">
      <button
        type="button"
        class="task-title"
        @click="selectTask"
      >
        {{ task.title }}
      </button>

      <StatusBadge :status="task.status" />
    </div>

    <p class="description">
      {{ task.description }}
    </p>

    <div class="card-info">
      <div class="priority-row">
        <span>Пріоритет:</span>
        <PriorityBadge :priority="task.priority" />
      </div>

      <div class="due-date">
        Термін: {{ formattedDate }}
      </div>
    </div>

    <div class="card-actions">
      <button
        type="button"
        class="action-button primary-button"
        @click="changeStatus"
      >
        {{ statusActionText }}
      </button>

      <button
        type="button"
        class="action-button"
        @click="changePriority"
      >
        Змінити пріоритет
      </button>
    </div>

  </div>
</template>

<style scoped>
.task-card {
  min-width: 0;
  padding: 18px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e0e4ed;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}

.task-title {
  padding: 0;
  border: none;
  background: none;
  color: #26354d;
  font-size: 17px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.task-title:hover {
  color: #7952b3;
  text-decoration: underline;
}

.description {
  font-size: 14px;
  color: #596579;
  line-height: 1.5;
  margin: 16px 0;
}

.card-info {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.priority-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #596579;
  font-size: 13px;
}

.due-date {
  font-size: 13px;
  color: #596579;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.action-button {
  flex: 1;
  border: 1px solid #d5d9e4;
  background: #f2f3f8;
  color: #35445d;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
}

.primary-button {
  background: #7952b3;
  border-color: #7952b3;
  color: white;
}

.action-button:hover {
  opacity: 0.85;
}

.task-title:focus-visible,
.action-button:focus-visible {
  outline: 3px solid #7952b3;
  outline-offset: 3px;
}

@media (max-width: 600px) {
  .card-info {
    flex-direction: column;
  }

  .card-actions {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
  }
}
</style>
