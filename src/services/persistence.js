
import { reactive } from 'vue'
import { readSnapshot, writeSnapshot } from './database.js'
import { useTasksStore } from '../store/tasks.js'
import { useProjectsStore } from '../store/projects.js'

export const persistenceStatus = reactive({
  ready: false,
  saving: false,
  saved: false,
  error: null
})

let initialized = false
let saveTimer = null
let saveQueue = Promise.resolve()
let changeVersion = 0
let unsubscribeTasks = null
let unsubscribeProjects = null

export async function initializePersistence(pinia) {
  if (initialized) {
    return
  }

  initialized = true

  const tasksStore = useTasksStore(pinia)
  const projectsStore = useProjectsStore(pinia)

  try {
    const snapshot = await readSnapshot()

    if (snapshot.initialized) {
      tasksStore.$patch({
        tasks: snapshot.tasks
      })

      projectsStore.$patch({
        projects: snapshot.projects
      })
    } else {
      await writeSnapshot({
        tasks: tasksStore.tasks,
        projects: projectsStore.projects
      })
    }

    persistenceStatus.ready = true
    persistenceStatus.saved = true
    persistenceStatus.error = null

    // Стежимо за змінами обох сховищ
    const subscribeToChanges = () => {
      changeVersion += 1
      persistenceStatus.saved = false
      persistenceStatus.saving = true
      persistenceStatus.error = null

      if (saveTimer !== null) {
        clearTimeout(saveTimer)
      }

      saveTimer = setTimeout(() => {
        saveTimer = null

        const version = changeVersion

        // Створюємо звичайні об'єкти для IndexedDB
        const data = {
          tasks: JSON.parse(JSON.stringify(tasksStore.tasks)),
          projects: JSON.parse(JSON.stringify(projectsStore.projects))
        }

        // Послідовне виконання записів
        saveQueue = saveQueue
          .catch(() => {})
          .then(() => writeSnapshot(data))
          .then(() => {
            if (version === changeVersion) {
              persistenceStatus.saved = true
              persistenceStatus.saving = false
            }
          })
          .catch(error => {
            persistenceStatus.error = error.message
            persistenceStatus.saving = false
            persistenceStatus.saved = false
            console.error('IndexedDB save error:', error)
          })
      }, 300)
    }

    unsubscribeTasks = tasksStore.$subscribe(
      subscribeToChanges,
      { detached: true, deep: true }
    )

    unsubscribeProjects = projectsStore.$subscribe(
      subscribeToChanges,
      { detached: true, deep: true }
    )
  } catch (error) {
    initialized = false
    persistenceStatus.ready = false
    persistenceStatus.saved = false
    persistenceStatus.saving = false
    persistenceStatus.error = error.message

    console.error('IndexedDB initialization error:', error)

    throw error
  }
}

export function stopPersistence() {
  if (saveTimer !== null) {
    clearTimeout(saveTimer)
    saveTimer = null
  }

  if (unsubscribeTasks) {
    unsubscribeTasks()
    unsubscribeTasks = null
  }

  if (unsubscribeProjects) {
    unsubscribeProjects()
    unsubscribeProjects = null
  }

  initialized = false
  persistenceStatus.ready = false
}
