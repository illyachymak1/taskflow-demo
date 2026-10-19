
<template>
  <f7-page name="home">
    <f7-navbar title="TaskFlow">
      <f7-nav-right>
        <f7-link href="/about/">Про застосунок</f7-link>
      </f7-nav-right>
    </f7-navbar>

    <f7-block-title>Статистика завдань</f7-block-title>

    <div class="stats-container">
      <div class="stat-card">
        <span class="stat-icon">📋</span>
        <div class="stat-number">{{ totalTasks }}</div>
        <div class="stat-label">Усього завдань</div>
      </div>

      <div class="stat-card">
        <span class="stat-icon">✅</span>
        <div class="stat-number">{{ completedTasks }}</div>
        <div class="stat-label">Виконано</div>
      </div>

      <div class="stat-card">
        <span class="stat-icon">⏳</span>
        <div class="stat-number">{{ pendingTasks }}</div>
        <div class="stat-label">Очікує виконання</div>
      </div>
    </div>

    <f7-block-title>Мої завдання</f7-block-title>

    <f7-list v-if="tasks.length > 0" strong inset dividers>
      <f7-list-item
        v-for="task in tasks"
        :key="task.id"
        :title="task.title"
        :subtitle="'Пріоритет: ' + task.priority"
        :after="task.done ? 'Готово' : 'В роботі'"
        checkbox
        :checked="task.done"
        @change="task.done = !task.done"
      />
    </f7-list>

    <f7-block v-else strong inset>
      Завдань поки немає
    </f7-block>

    <f7-block-title>Додати завдання</f7-block-title>

    <f7-list strong inset>
      <f7-list-input
        label="Назва завдання"
        type="text"
        placeholder="Введіть назву"
        :value="newTask"
        @input="newTask = $event.target.value"
      />
    </f7-list>

    <f7-block>
      <f7-button fill @click="saveTask">
        Додати завдання
      </f7-button>
    </f7-block>
  </f7-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { tasks, addTask } from '../data/tasks.js'

const newTask = ref('')

const totalTasks = computed(() => tasks.value.length)

const completedTasks = computed(() =>
  tasks.value.filter(task => task.done).length
)

const pendingTasks = computed(() =>
  totalTasks.value - completedTasks.value
)

function saveTask() {
  addTask(newTask.value)
  newTask.value = ''
}
</script>

<style scoped>
.stats-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 16px;
}

.stat-card {
  background: #f0f2fa;
  border-radius: 14px;
  padding: 20px 12px;
  text-align: center;
  color: #4b628f;
}

.stat-icon {
  display: block;
  font-size: 28px;
  line-height: 1.2;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  margin-top: 10px;
}

.stat-label {
  font-size: 14px;
  margin-top: 5px;
}

@media (max-width: 600px) {
  .stats-container {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .stat-card {
    padding: 14px 12px;
    border-radius: 12px;
  }

  .stat-number {
    font-size: 24px;
  }

  .stat-label {
    font-size: 13px;
  }
}
</style>
