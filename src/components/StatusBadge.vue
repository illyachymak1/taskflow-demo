
<template>
  <span class="status-badge" :class="status">
    {{ statusText }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: 'todo'
  }
})

const statusText = computed(() => {
  if (props.status === 'done') {
    return 'Виконано'
  }

  if (props.status === 'progress') {
    return 'У роботі'
  }

  return 'Заплановано'
})
</script>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.todo {
  background-color: #e5e7eb;
  color: #374151;
}

.progress {
  background-color: #ffedd5;
  color: #9a3412;
}

.done {
  background-color: #dcfce7;
  color: #166534;
}
</style>
