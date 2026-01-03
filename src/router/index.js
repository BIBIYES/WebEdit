import { createRouter, createWebHistory } from 'vue-router'
import CodeEditView from '../views/CodeEditView.vue'
import LoginView from '../views/LoginView.vue'
import TerminalEmulator from '../views/TerminalEmulatorView.vue'

const AUTH_STORAGE_KEY = 'sandbox_auth_key'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/',
      name: 'CodeEditView',
      component: CodeEditView,
    },
    {
      path: '/terminal-emulator',
      name: 'TerminalEmulator',
      component: TerminalEmulator,
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authKey = localStorage.getItem(AUTH_STORAGE_KEY)
  if (to.name !== 'login' && !authKey) {
    next({ name: 'login' })
    return
  }
  if (to.name === 'login' && authKey) {
    next({ name: 'home' })
    return
  }
  next()
})

export default router
