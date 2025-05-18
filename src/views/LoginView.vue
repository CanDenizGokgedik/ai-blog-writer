<template>
  <div class="login-container">
    <div class="form-card">
      <div v-if="loginSuccess === true">
        <div class="success-message">
          <i class="fas fa-check-circle success-icon"></i>
          <h2 class="success-title">Login Successful!</h2>
          <p>Welcome back to AI Blog Writer!</p>
          <p class="redirect-text">Redirecting in {{ redirectCountdown }} seconds...</p>
          <div class="redirect-progress">
            <div class="progress-bar" :style="{width: progressWidth + '%'}"></div>
          </div>
        </div>
      </div>
      
      <div v-else>
        <h1>Sign In</h1>
        <p class="subtitle">Sign in to access your AI blog writing tools</p>
        
        <!-- Error Message -->
        <div v-if="error" class="error-message">
          <i class="fas fa-exclamation-circle"></i> {{ error }}
        </div>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              required 
              placeholder="your@email.com"
              class="form-input"
              :disabled="loading"
            >
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              v-model="password" 
              required 
              placeholder="Your password"
              class="form-input"
              :disabled="loading"
            >
          </div>
          
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn-primary"
              :disabled="loading || !email || !password"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin"></i>
              <span v-if="loading">Signing in...</span>
              <span v-else>Sign In</span>
            </button>
          </div>
        </form>
        
        <div class="auth-links">
          <p>Don't have an account? <router-link to="/register">Register</router-link></p>
          <p><a href="#" @click.prevent="forgotPassword">Forgot password?</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'

const router = useRouter()
const userStore = useUserStore()
const auth = getAuth()
const route = useRouter().currentRoute.value

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const loginSuccess = ref(false)
const redirectPath = route.query.redirect || '/'

// Redirect countdown timer
const redirectCountdown = ref(3)
const progressWidth = ref(0)
let countdownInterval = null

// Get the global auth check function if available
const checkAuthState = inject('checkAuthState', () => null)

// Make sure auth state is tracked
onMounted(() => {
  // Run the global auth check function
  checkAuthState()
  
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    console.log('Auth state in LoginView:', user ? `User logged in: ${user.email}` : 'No user')
  })
  
  return () => unsubscribe()
})

// Start countdown timer for redirect
const startCountdown = () => {
  // Clear any existing interval
  if (countdownInterval) clearInterval(countdownInterval)
  
  redirectCountdown.value = 3
  progressWidth.value = 0
  
  countdownInterval = setInterval(() => {
    redirectCountdown.value -= 1
    progressWidth.value = (3 - redirectCountdown.value) / 3 * 100
    
    if (redirectCountdown.value <= 0) {
      clearInterval(countdownInterval)
      // Navigate when countdown reaches zero
      try {
        window.location.href = redirectPath
      } catch (navError) {
        console.error('Failed to navigate with window.location:', navError)
        router.push(redirectPath).catch(e => console.error('Router navigation failed:', e))
      }
    }
  }, 1000)
}

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  
  try {
    console.log('Starting login process...')
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
    console.log('Login successful', userCredential.user)
    
    // Show success message
    loading.value = false
    console.log('Login successful, showing success message')
    loginSuccess.value = true
    
    // Start countdown for redirect
    console.log('Starting countdown for redirect')
    startCountdown()
  } catch (e) {
    console.error('Login error:', e)
    
    // Convert Firebase error codes to user-friendly messages
    if (e.code === 'auth/invalid-credential' || 
        e.code === 'auth/wrong-password' || 
        e.code === 'auth/user-not-found') {
      error.value = 'This username and password are incorrect!'
    } else if (e.code === 'auth/too-many-requests') {
      error.value = 'Too many failed login attempts. Please try again later.'
    } else if (e.code === 'auth/network-request-failed') {
      error.value = 'Network error. Please check your internet connection.'
    } else {
      error.value = 'Login failed. Please try again.'
    }
    
    loading.value = false
  }
}

const forgotPassword = () => {
  alert('Password reset functionality coming soon!')
}
</script>

<style scoped>
.login-container {
  max-width: 450px;
  margin: 3rem auto;
  padding: 0 1rem;
}

.form-card {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2rem;
  border: 1px solid #e5e7eb;
}

h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  color: #6b7280;
  text-align: center;
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 500;
  font-size: 0.95rem;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.7;
}

.form-actions {
  margin-top: 1rem;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  background-color: #4f46e5;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  gap: 0.5rem;
  background-color: #fee2e2;
  color: #b91c1c;
}

.success-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  margin-bottom: 1rem;
  gap: 1rem;
  background-color: #d1fae5;
  color: #047857;
  text-align: center;
  justify-content: center;
  min-height: 200px;
}

.success-icon {
  font-size: 3rem;
  color: #047857;
  margin-bottom: 1rem;
}

.success-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.redirect-text {
  margin-top: 1rem;
  font-weight: 500;
}

.redirect-progress {
  width: 100%;
  height: 6px;
  background-color: rgba(4, 120, 87, 0.2);
  border-radius: 3px;
  margin-top: 0.5rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #047857;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.auth-links {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
}

.auth-links a {
  color: #6366f1;
  text-decoration: none;
}

.auth-links a:hover {
  text-decoration: underline;
}

.auth-links p {
  margin: 0.5rem 0;
}

@media (max-width: 480px) {
  .form-card {
    padding: 1.5rem;
  }
  
  h1 {
    font-size: 1.5rem;
  }
}
</style> 