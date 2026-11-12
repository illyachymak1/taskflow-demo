
import { openDB } from 'idb'

const DB_NAME = 'taskflow-db'
const DB_VERSION = 1

let databasePromise = null

// Відкриття бази даних IndexedDB
export function getDatabase() {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(
      new Error('Цей браузер не підтримує IndexedDB.')
    )
  }

  if (!databasePromise) {
    databasePromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Сховище завдань
        if (!db.objectStoreNames.contains('tasks')) {
          db.createObjectStore('tasks', {
            keyPath: 'id'
          })
        }

        // Сховище проєктів
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', {
            keyPath: 'id'
          })
        }

        // Службові дані
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata')
        }
      }
    }).catch(error => {
      databasePromise = null
      throw error
    })
  }

  return databasePromise
}

// Зчитування збереженого стану
export async function readSnapshot() {
  const db = await getDatabase()

  const tx = db.transaction(
    ['tasks', 'projects', 'metadata'],
    'readonly'
  )

  const [
    tasks,
    projects,
    initialized,
    nextProjectId
  ] = await Promise.all([
    tx.objectStore('tasks').getAll(),
    tx.objectStore('projects').getAll(),
    tx.objectStore('metadata').get('initialized'),
    tx.objectStore('metadata').get('nextProjectId')
  ])

  await tx.done

  return {
    tasks,
    projects,
    initialized: initialized === true,
    nextProjectId
  }
}

// Атомарне збереження завдань і проєктів
export async function writeSnapshot(snapshot) {
  if (
    !snapshot ||
    !Array.isArray(snapshot.tasks) ||
    !Array.isArray(snapshot.projects)
  ) {
    throw new Error('Некоректні дані для збереження.')
  }

  // Перетворення реактивних об'єктів Pinia
  // на звичайні об'єкти JavaScript
  const tasks = JSON.parse(
    JSON.stringify(snapshot.tasks)
  )

  const projects = JSON.parse(
    JSON.stringify(snapshot.projects)
  )

  // Відкриття бази даних
  const db = await getDatabase()

  // Обчислення наступного числового ID проєкту
  const calculatedNextId =
    projects.reduce(
      (maxId, project) =>
        Math.max(maxId, Number(project.id) || 0),
      0
    ) + 1

  const nextProjectId =
    Number.isSafeInteger(snapshot.nextProjectId) &&
    snapshot.nextProjectId >= calculatedNextId
      ? snapshot.nextProjectId
      : calculatedNextId

  // Створення транзакції
  const tx = db.transaction(
    ['tasks', 'projects', 'metadata'],
    'readwrite'
  )

  const taskStore = tx.objectStore('tasks')
  const projectStore = tx.objectStore('projects')
  const metadataStore = tx.objectStore('metadata')

  // Видалення попереднього знімка даних
  await Promise.all([
    taskStore.clear(),
    projectStore.clear()
  ])

  // Запис актуальних завдань і проєктів
  await Promise.all([
    ...tasks.map(task =>
      taskStore.put(task)
    ),

    ...projects.map(project =>
      projectStore.put(project)
    ),

    metadataStore.put(
      true,
      'initialized'
    ),

    metadataStore.put(
      nextProjectId,
      'nextProjectId'
    )
  ])

  // Очікування завершення транзакції
  await tx.done
}
