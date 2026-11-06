
import { defineStore } from 'pinia'
import { useTasksStore } from './tasks.js'

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    projects: [
      {
        id: 1,
        name: 'Розробка TaskFlow',
        description: 'Розробка та вдосконалення PWA-застосунку TaskFlow.'
      },
      {
        id: 2,
        name: 'Навчальні завдання',
        description: 'Практичні роботи та навчальні проєкти.'
      },
      {
        id: 3,
        name: 'Особисті завдання',
        description: 'Особисті справи та плани.'
      }
    ]
  }),

  getters: {
    totalProjects: state => state.projects.length,

    projectStats(state) {
      const tasksStore = useTasksStore()

      return state.projects.map(project => {
        const projectTasks = tasksStore.tasks.filter(
          task => Number(task.projectId) === project.id
        )

        const total = projectTasks.length

        const completed = projectTasks.filter(
          task => task.status === 'done'
        ).length

        const pending = total - completed

        const progress = total === 0
          ? 0
          : Math.round((completed / total) * 100)

        return {
          ...project,
          total,
          completed,
          pending,
          progress
        }
      })
    }
  },

  actions: {
    getProjectById(id) {
      return this.projects.find(
        project => project.id === Number(id)
      ) ?? null
    },

    addProject(data) {
      const name = String(data.name ?? '').trim()

      if (!name) {
        return null
      }

      const nextId = this.projects.length
        ? Math.max(...this.projects.map(project => project.id)) + 1
        : 1

      const project = {
        id: nextId,
        name,
        description: String(data.description ?? '').trim()
      }

      this.projects.push(project)
      return project
    },

    updateProject(id, data) {
      const project = this.getProjectById(id)

      if (!project) {
        return false
      }

      const name = String(data.name ?? '').trim()

      if (!name) {
        return false
      }

      project.name = name
      project.description = String(data.description ?? '').trim()

      return true
    },

    deleteProject(id) {
      const index = this.projects.findIndex(
        project => project.id === Number(id)
      )

      if (index === -1) {
        return false
      }

      this.projects.splice(index, 1)
      return true
    }
  }
})
