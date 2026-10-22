
<template>
  <span class="priority-badge" :class="priority">
    {{ priorityText }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  priority: {
    type: String,
    required: true
  }
})

const priorityText = computed(() => {
  if (props.priority === 'high') {
    return 'Високий'
  }

  if (props.priority === 'medium') {
    return 'Середній'
  }

  if (props.priority === 'low') {
    return 'Низький'
  }

  return 'Не визначено'
})
</script>

<style scoped>
.priority-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.low {
  background-color: #dcfce7;
  color: #166534;
}

.medium {
  background-color: #fef3c7;
  color: #92400e;
}

.high {
  background-color: #fee2e2;
  color: #991b1b;
}
</style>
