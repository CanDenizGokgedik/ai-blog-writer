<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-left">
        <router-link to="/" class="brand-logo">
          <i class="fas fa-feather-alt"></i>
          <span>AI Blog Writer</span>
        </router-link>
        
        <div class="navbar-menu main-links">
          <router-link to="/" class="nav-link">Home</router-link>
          
          <!-- Links for authenticated users -->
          <template v-if="isLoggedIn">
            <router-link to="/create" class="nav-link">
              <i class="fas fa-plus-circle"></i> New Post
            </router-link>
          </template>
        </div>
      </div>
      
      <div class="navbar-menu auth-links">
        <!-- User account dropdown for authenticated users -->
        <template v-if="isLoggedIn">
          <div class="dropdown">
            <button class="dropdown-toggle">
              <div class="user-info">
                <span class="username">{{ userName || 'User' }}</span>
              </div>
              <i class="fas fa-chevron-down"></i>
            </button>
            <div class="dropdown-menu">
              <router-link to="/profile" class="dropdown-item">
                <i class="fas fa-user-circle"></i> Your Account
              </router-link>
              <hr class="dropdown-divider" />
              <a href="#" class="dropdown-item" @click.prevent="handleLogout">
                <i class="fas fa-sign-out-alt"></i> Logout
              </a>
            </div>
          </div>
        </template>
        
        <!-- Links for guests -->
        <template v-else-if="authReady">
          <router-link to="/login" class="nav-link">Login</router-link>
          <router-link to="/register" class="btn-register">Register</router-link>
        </template>
        
        <!-- Loading state -->
        <template v-else>
          <div class="nav-loading">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'

const router = useRouter()
const auth = getAuth()
const isLoggedIn = ref(false)
const userName = ref('')
const authReady = ref(false)

onMounted(() => {
  // Use direct Firebase auth to check login status
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    authReady.value = true
    
    if (user) {
      isLoggedIn.value = true
      userName.value = user.displayName || user.email
      console.log('NavBar detected user:', user.email)
    } else {
      isLoggedIn.value = false
      userName.value = ''
      console.log('NavBar detected no user logged in')
    }
  })
  
  // Clean up subscription when component unmounts
  return () => unsubscribe()
})

const handleLogout = async () => {
  try {
    await signOut(auth)
    console.log('User logged out successfully')
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

<style scoped>
.navbar {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 0.75rem 1rem;
  position: sticky;
  top: 0;
  z-index: 50;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 2rem; /* Reduced space between logo and navigation */
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6366f1;
  font-weight: 700;
  font-size: 1.25rem;
  text-decoration: none;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.main-links {
  /* Additional styling for main navigation links */
}

.auth-links {
  /* Styling for authentication links */
}

.nav-link {
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.nav-link:hover {
  color: #6366f1;
}

.btn-register {
  padding: 0.5rem 1rem;
  background-color: #6366f1;
  color: white;
  border-radius: 0.375rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-register:hover {
  background-color: #4f46e5;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.dropdown-toggle:hover {
  background-color: #f9fafb;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.username {
  font-weight: 500;
  color: #1f2937;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  background-color: white;
  border-radius: 0.375rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  width: 220px;
  overflow: hidden;
  z-index: 10;
  display: none;
}

.dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4b5563;
  text-decoration: none;
  padding: 0.75rem 1rem;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.dropdown-item:hover {
  background-color: #f9fafb;
  color: #6366f1;
}

.dropdown-divider {
  margin: 0.25rem 0;
  border: none;
  border-top: 1px solid #e5e7eb;
}

.nav-loading {
  color: #6366f1;
  font-size: 1.125rem;
}

@media (max-width: 768px) {
  .navbar-left {
    gap: 1rem; /* Even less space on smaller screens */
  }
  
  .navbar-menu {
    gap: 1rem;
  }
  
  .username {
    display: none;
  }
}

@media (max-width: 480px) {
  .brand-logo span {
    display: none;
  }
  
  .nav-link span {
    display: none;
  }
}
</style> 