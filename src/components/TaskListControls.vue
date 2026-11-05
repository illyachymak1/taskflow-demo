
<script setup>
import { computed } from 'vue'

const props = defineProps({
  search: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'all'
  },
  priority: {
    type: String,
    default: 'all'
  },
  sort: {
    type: String,
    default: 'default'
  },
  onlyIncomplete: {
    type: Boolean,
    default: false
  },
  total: {
    type: Number,
    default: 0
  },
  found: {
    type: Number,
    default: 0
  },
  completed: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'update:search',
  'update:status',
  'update:priority',
  'update:sort',
  'update:onlyIncomplete',
  'reset'
])

const searchValue = computed({
  get: () => props.search,
  set: value => emit('update:search', value)
})

const statusValue = computed({
  get: () => props.status,
  set: value => emit('update:status', value)
})

const priorityValue = computed({
  get: () => props.priority,
  set: value => emit('update:priority', value)
})

const sortValue = computed({
  get: () => props.sort,
  set: value => emit('update:sort', value)
})

const onlyIncompleteValue = computed({
  get: () => props.onlyIncomplete,
  set: value => emit('update:onlyIncomplete', value)
})

const completionPercent = computed(() => {
  if (props.total === 0) {
    return 0
  }

  return Math.round(props.completed / props.total * 100)
})

const hasFilters = computed(() =>
  props.search.trim() !== '' ||
  props.status !== 'all' ||
  props.priority !== 'all' ||
  props.sort !== 'default' ||
  props.onlyIncomplete
)
</script>

<template>
  <section class="task-controls">
    <div class="controls-heading">
      <h2>Пошук, фільтрація та сортування</h2>

      <div class="results-info">
        <span class="results-count">
          Знайдено: {{ found }} із {{ total }}
        </span>

        <span class="completion-count">
          Виконано: {{ completionPercent }}%
        </span>
      </div>
    </div>

    <div class="controls-grid">
      <div class="control-group">
        <label for="task-search">
          Пошук за назвою та описом
        </label>

        <div class="search-wrapper">
          <input
            id="task-search"
            v-model="searchValue"
            type="search"
            placeholder="Введіть текст для пошуку"
          />

          <button
            v-if="searchValue"
            type="button"
            class="clear-search"
            aria-label="Очистити пошук"
            @click="searchValue = ''"
          >
            ×
          </button>
        </div>
      </div>

      <div class="control-group">
        <label for="task-status">
          Статус
        </label>

        <select
          id="task-status"
          v-model="statusValue"
        >
          <option value="all">Усі статуси</option>
          <option value="todo">Заплановано</option>
          <option value="progress">У роботі</option>
          <option value="done">Виконано</option>
        </select>
      </div>

      <div class="control-group">
        <label for="task-priority">
          Пріоритет
        </label>

        <select
          id="task-priority"
          v-model="priorityValue"
        >
          <option value="all">Усі пріоритети</option>
          <option value="high">Високий</option>
          <option value="medium">Середній</option>
          <option value="low">Низький</option>
        </select>
      </div>

      <div class="control-group">
        <label for="task-sort">
          Сортування
        </label>

        <select
          id="task-sort"
          v-model="sortValue"
        >
          <option value="default">
            За порядком додавання
          </option>

          <option value="title-asc">
            Назва: А → Я
          </option>

          <option value="title-desc">
            Назва: Я → А
          </option>

          <option value="priority-high">
            Пріоритет: високий → низький
          </option>

          <option value="priority-low">
            Пріоритет: низький → високий
          </option>

          <option value="status">
            Статус: У роботі → Заплановано → Виконано
          </option>

          <option value="date-asc">
            Дата: найближчі спочатку
          </option>

          <option value="date-desc">
            Дата: найпізніші спочатку
          </option>
        </select>
      </div>
    </div>

    <div class="quick-filters">
      <label class="checkbox-label">
        <input
          v-model="onlyIncompleteValue"
          type="checkbox"
        />

        <span>Тільки невиконані</span>
      </label>

      <p class="quick-filter-description">
        Показувати лише заплановані завдання
        та завдання в роботі.
      </p>
    </div>

    <div class="controls-footer">
      <p
        v-if="hasFilters"
        class="filter-note"
      >
        Активні параметри пошуку або фільтрації
      </p>

      <button
        type="button"
        class="reset-button"
        @click="emit('reset')"
      >
        Скинути фільтри
      </button>
    </div>
  </section>
</template>

<style scoped>
.task-controls {
  background: #ffffff;
  border: 1px solid #e0e5ef;
  border-radius: 14px;
  padding: 20px;
  margin: 20px 0 24px;
}

.controls-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 18px;
}

.controls-heading h2 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #26354d;
}

.results-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.results-count {
  font-size: 13px;
  color: #64748b;
}

.completion-count {
  font-size: 13px;
  font-weight: 600;
  color: #7952b3;
  background: #f5f0fb;
  padding: 6px 10px;
  border-radius: 8px;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.control-group label {
  font-size: 13px;
  font-weight: 600;
  color: #26354d;
}

.control-group input,
.control-group select {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #26354d;
  font-size: 14px;
}

.control-group input:focus,
.control-group select:focus {
  outline: 2px solid #7952b3;
  outline-offset: 1px;
}

.search-wrapper {
  position: relative;
}

.search-wrapper input {
  padding-right: 42px;
}

.clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 22px;
  cursor: pointer;
}

.quick-filters {
  margin-top: 18px;
  padding: 14px 16px;
  background: #f5f3fa;
  border: 1px solid #e2d9f0;
  border-radius: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #26354d;
  cursor: pointer;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: #7952b3;
  cursor: pointer;
}

.quick-filter-description {
  margin: 8px 0 0 28px;
  font-size: 12px;
  color: #64748b;
}

.controls-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 18px;
}

.filter-note {
  color: #7952b3;
  font-size: 13px;
  margin: 0;
}

.reset-button {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #7952b3;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.reset-button:hover {
  background: #68439f;
}

@media (max-width: 700px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }

  .task-controls {
    padding: 16px;
  }

  .results-info {
    gap: 8px;
  }
}
</style>
