import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../views/HistoryView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
    },
    {
      path: '/rows',
      name: 'rows',
      component: () => import('../views/SeeAllRowsView.vue'),
    },
    {
      path: '/row/:id',
      name: 'row-details',
      component: () => import('../views/RowDetailsView.vue'),
    }
  ],
})

export default router
