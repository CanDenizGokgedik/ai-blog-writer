<script setup>
import { onMounted, ref, provide } from 'vue'
import NavBar from './components/NavBar.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { useUserStore } from './stores/userStore'

const router = useRouter()
const auth = getAuth()
const isAuthReady = ref(false)
const userStore = useUserStore()
const currentUser = ref(null)

// Function to manually check auth state - provide to child components
const checkAuthState = () => {
  const user = auth.currentUser
  console.log('Manual auth check:', user ? `User is logged in: ${user.email}` : 'No user')
  currentUser.value = user
  return user
}

// Make auth check function available to all components
provide('checkAuthState', checkAuthState)

onMounted(() => {
  console.log('App mounted, initializing auth state')
  
  // Initialize auth store
  userStore.initAuth()
  
  // Set up a direct auth state listener as backup
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed in App.vue:', user ? `User logged in: ${user.email}` : 'User logged out')
    currentUser.value = user
    isAuthReady.value = true
    
    // Force check on all route navigation
    checkAuthState()
  }, (error) => {
    console.error('Auth observer error:', error)
    isAuthReady.value = true
  })
  
  // Check auth state immediately
  checkAuthState()
  
  // Clean up subscription
  return () => unsubscribe()
})
</script>

<template>
  <div id="app">
    <NavBar />
    <main>
      <div v-if="!isAuthReady" class="loading-container">
        <span class="loading-spinner">
          <font-awesome-icon icon="spinner" spin />
        </span>
        <p>Loading application...</p>
      </div>
      <router-view v-else />
    </main>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');

:root {
  --primary-color: #6366f1;
  --primary-hover: #4f46e5;
  --secondary-color: #10b981;
  --accent-color: #f97316;
  --text-color: #334155;
  --light-text: #64748b;
  --bg-color: #f8fafc;
  --card-bg: #ffffff;
  --border-color: #e2e8f0;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --transition: all 0.3s ease;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Poppins', sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--bg-color);
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background-color: var(--card-bg);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.logo a {
  font-family: 'Playfair Display', serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo a::before {
  content: '✍️';
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 0;
  position: relative;
  transition: var(--transition);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--primary-color);
  transition: var(--transition);
}

.nav-link:hover {
  color: var(--primary-color);
}

.nav-link:hover::after {
  width: 100%;
}

.router-link-active {
  color: var(--primary-color);
  font-weight: 600;
}

.router-link-active::after {
  width: 100%;
  background-color: var(--primary-color);
}

main {
  flex: 1;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
}

main > * {
  max-width: 1200px;
  margin: 0 auto;
}

/* Special class for pages that need wider content */
.wide-content > * {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

footer {
  background-color: var(--primary-color);
  color: white;
  text-align: center;
  padding: 1.5rem;
  margin-top: auto;
  font-size: 0.9rem;
}

/* Global button styles */
button {
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  border: none;
  border-radius: var(--radius-md);
  transition: var(--transition);
}

/* Global card styles */
.card {
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: var(--transition);
  overflow: hidden;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-5px);
}

/* Loading state */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 1rem;
}

.loading-spinner {
  font-size: 2rem;
  color: var(--primary-color);
}

/* Responsive design */
@media (max-width: 1024px) {
  main {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .nav-links {
    width: 100%;
    justify-content: space-between;
  }
  
  main {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0.75rem;
  }
  
  .logo a {
    font-size: 1.4rem;
  }
  
  .nav-links {
    gap: 0.75rem;
    font-size: 0.9rem;
  }
  
  main {
    padding: 0.75rem;
  }
  
  footer {
    padding: 1rem;
    font-size: 0.8rem;
  }
}
</style>
