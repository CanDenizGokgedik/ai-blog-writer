<template>
  <div class="register-container">
    <div class="form-card">
      <div v-if="registrationSuccess === true">
        <div class="success-message">
          <i class="fas fa-check-circle success-icon"></i>
          <h2 class="success-title">Account Created!</h2>
          <p>Registration successful! You are now a member of AI Blog Writer.</p>
          <p class="redirect-text">Redirecting to home page in {{ redirectCountdown }} seconds...</p>
          <div class="redirect-progress">
            <div class="progress-bar" :style="{width: progressWidth + '%'}"></div>
          </div>
        </div>
      </div>
      
      <div v-else>
        <h1>Create Account</h1>
        <p class="subtitle">Join to start creating AI-powered blog content</p>
        
        <!-- Error Message -->
        <div v-if="error" class="error-message">
          <i class="fas fa-exclamation-circle"></i> {{ error }}
        </div>
        
        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label for="displayName">Name</label>
            <input 
              type="text" 
              id="displayName" 
              v-model="displayName" 
              required 
              placeholder="Your name"
              class="form-input"
              :disabled="loading"
            >
          </div>
          
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
              placeholder="Create a password"
              class="form-input"
              :disabled="loading"
            >
            <p class="input-hint">Password must be at least 6 characters</p>
          </div>
          
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn-primary"
              :disabled="loading || !displayName || !email || password.length < 6"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin"></i>
              <span v-if="loading">Creating account...</span>
              <span v-else>Create Account</span>
            </button>
          </div>
        </form>
        
        <div class="auth-links">
          <p>Already have an account? <router-link to="/login">Sign In</router-link></p>
        </div>
        
        <div class="terms">
          By creating an account, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </div>
      </div>
    </div>
    
    <div v-if="registrationSuccess" class="debug-info">
      Registration Success: {{ registrationSuccess }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, getFirestore, serverTimestamp } from 'firebase/firestore'

const router = useRouter()
const auth = getAuth()
const db = getFirestore()
const route = useRouter().currentRoute.value

const displayName = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const registrationSuccess = ref(false)
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
    console.log('Auth state in RegisterView:', user ? `User logged in: ${user.email}` : 'No user')
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
        window.location.href = '/'
      } catch (navError) {
        console.error('Failed to navigate with window.location:', navError)
        router.push('/').catch(e => console.error('Router navigation failed:', e))
      }
    }
  }, 1000)
}

const handleRegister = async () => {
  error.value = ''
  
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }
  
  loading.value = true
  
  try {
    console.log('Starting registration process...')
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    console.log('Firebase account created successfully:', userCredential.user.uid)
    
    // Update profile with display name
    await updateProfile(userCredential.user, {
      displayName: displayName.value
    })
    console.log('Display name updated successfully')
    
    // Create user document in Firestore
    try {
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        displayName: displayName.value,
        email: email.value,
        membership: 'free',
        postsThisMonth: 0,
        totalPosts: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      console.log('Firestore user document created successfully')
    } catch (firestoreErr) {
      console.error('Error creating user document:', firestoreErr)
    }
    
    // Force UI update and show success message
    loading.value = false
    console.log('Registration successful, showing success message')
    registrationSuccess.value = true
    
    // Start countdown for redirect
    console.log('Starting countdown for redirect')
    startCountdown()
    
  } catch (e) {
    console.error('Registration error:', e)
    
    // Convert Firebase error codes to user-friendly messages
    if (e.code === 'auth/email-already-in-use') {
      error.value = 'This email is already registered. Please use a different email.'
    } else if (e.code === 'auth/weak-password') {
      error.value = 'Password is too weak. Please choose a stronger password.'
    } else if (e.code === 'auth/invalid-email') {
      error.value = 'Please enter a valid email address.'
    } else if (e.code === 'auth/network-request-failed') {
      error.value = 'Network error. Please check your internet connection.'
    } else {
      error.value = 'Registration failed. Please try again.'
    }
    
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
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

.register-form {
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

.input-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: -0.25rem;
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

.terms {
  margin-top: 1.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
}

.terms a {
  color: #6366f1;
  text-decoration: none;
}

.terms a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .form-card {
    padding: 1.5rem;
  }
  
  h1 {
    font-size: 1.5rem;
  }
}

.debug-info {
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: #6c757d;
  display: none; /* Hide in production */
}
</style> 