import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'

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
      name: 'home',
      component: HomeView,
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
