import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CreatePostView from '../views/CreatePostView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '../views/ProfileView.vue'
import { useUserStore } from '../stores/userStore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const router = createRouter({ 
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { 
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/create',
      name: 'create',
      component: CreatePostView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guestOnly: true }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { guestOnly: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    }
  ]
})

// Get current user and wait for Firebase Auth to initialize before resolving
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    }, reject)
  })
}

// Navigation guards
router.beforeEach(async (to, from, next) => {
  console.log('Router guard running for:', to.fullPath)
  
  // Wait for Firebase Auth to initialize
  const currentUser = await getCurrentUser()
  
  // For routes that require authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!currentUser) {
      console.log('Route requires auth but no user found - redirecting to login:', to.fullPath)
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      console.log('User authenticated, proceeding to:', to.fullPath)
      next()
    }
  } 
  // For guest-only routes (login, register)
  else if (to.matched.some(record => record.meta.guestOnly)) {
    if (currentUser) {
      console.log('User already authenticated, redirecting from guest-only route to home')
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
