
<template>
  <f7-page name="tasks">
    <f7-navbar title="Мої завдання" />

    <f7-block-title>Список завдань</f7-block-title>

    <f7-block>
      <p>Усього завдань: {{ tasks.length }}</p>
      <p>Виконано: {{ completedCount }}</p>
    </f7-block>

    <f7-list strong inset dividers>
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

    <f7-block-title>Нове завдання</f7-block-title>

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
      <f7-button fill round @click="saveTask">
        Додати завдання
      </f7-button>
    </f7-block>
  </f7-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { tasks, addTask } from '../data/tasks.js'

const newTask = ref('')

const completedCount = computed(() => {
  return tasks.value.filter(task => task.done).length
})

function saveTask() {
  addTask(newTask.value)
  newTask.value = ''
}
</script>
