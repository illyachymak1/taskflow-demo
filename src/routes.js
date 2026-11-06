
import HomePage from './pages/HomePage.vue'
import TasksPage from './pages/TasksPage.vue'
import ProjectsPage from './pages/ProjectsPage.vue'
import AboutPage from './pages/AboutPage.vue'
import HelpPage from './pages/HelpPage.vue'

const routes = [
  {
    path: '/',
    component: HomePage,
  },
  {
    path: '/tasks/',
    component: TasksPage,
  },
  {
    path: '/projects/',
    component: ProjectsPage,
  },
  {
    path: '/about/',
    component: AboutPage,
  },
  {
    path: '/help/',
    component: HelpPage,
  },
]

export default routes
