
<script setup>
defineProps({
  count: {
    type: Number,
    required: true
  },
  label: {
    type: String,
    default: 'Завдання'
  }
})
</script>

<template>
  <div class="task-counter">
    <span class="counter-number">{{ count }}</span>
    <span class="counter-label">{{ label }}</span>
  </div>
</template>

<style scoped>
.task-counter {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 10px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  text-align: center;
}

.counter-number {
  font-size: 30px;
  font-weight: bold;
  color: #7952b3;
}

.counter-label {
  margin-top: 8px;
  font-size: 13px;
  color: #64748b;
}
</style>
