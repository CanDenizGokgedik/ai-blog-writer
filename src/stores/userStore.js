import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  updateProfile,
  getAuth
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  enableNetwork,
  disableNetwork 
} from 'firebase/firestore'
import { auth, db, checkFirebaseHealth } from '../firebase/config'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const isOffline = ref(false)
  const retryCount = ref(0)
  const membershipPlans = ref([
    { id: 'free', name: 'Free', postsPerMonth: 3, price: 0 },
    { id: 'basic', name: 'Basic', postsPerMonth: 10, price: 9.99 },
    { id: 'premium', name: 'Premium', postsPerMonth: 50, price: 19.99 },
    { id: 'unlimited', name: 'Unlimited', postsPerMonth: Infinity, price: 49.99 }
  ])

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const currentMembership = computed(() => {
    if (!user.value || !user.value.membership) return membershipPlans.value[0]
    return membershipPlans.value.find(plan => plan.id === user.value.membership) || membershipPlans.value[0]
  })
  const postsRemaining = computed(() => {
    if (!user.value) return 0
    const limit = currentMembership.value.postsPerMonth
    return limit - (user.value.postsThisMonth || 0)
  })

  // Network status
  const updateNetworkStatus = () => {
    const online = navigator.onLine
    
    console.log('Network status check - Online:', online)
    
    // Always update the offline status based on current network state
    isOffline.value = !online
    
    // If we're online, make sure Firestore network is enabled
    if (online) {
      console.log('App is online, enabling Firestore network')
      // Always try to enable network when online is detected
      enableNetwork(db)
        .then(() => {
          console.log('Firestore network re-enabled successfully')
          // Reset any network-related errors
          if (error.value && (
              error.value.includes('offline') || 
              error.value.includes('network') ||
              error.value.includes('connection')
            )) {
            error.value = null
          }
          
          // Refresh user data if authenticated
          if (auth.currentUser) {
            console.log('Refreshing user data after network restored')
            fetchUserData(auth.currentUser.uid)
              .catch(err => console.error('Error refreshing user data:', err))
          }
        })
        .catch(err => console.error('Error re-enabling network:', err))
    }
  }
  
  // Force a manual connection refresh
  const refreshConnection = () => {
    console.log('Manually refreshing connection status')
    // Check actual network status
    const online = navigator.onLine
    isOffline.value = !online
    
    if (online) {
      isLoading.value = true
      // Force enable the network
      enableNetwork(db)
        .then(() => {
          console.log('Network manually re-enabled')
          error.value = null
          // Try to refresh user data
          if (auth.currentUser) {
            return fetchUserData(auth.currentUser.uid)
          }
        })
        .catch(err => {
          console.error('Error manually enabling network:', err)
          error.value = 'Could not connect to Firebase. Please try again.'
        })
        .finally(() => {
          isLoading.value = false
        })
    } else {
      error.value = 'You appear to be offline. Please check your internet connection.'
    }
  }
  
  // Set up network status listeners
  window.addEventListener('online', () => {
    console.log('Online event detected')
    // Immediately update offline status when online event fires
    isOffline.value = false
    // Then run the full update function
    updateNetworkStatus()
  })
  
  window.addEventListener('offline', () => {
    console.log('Offline event detected')
    isOffline.value = true
    // Disable network to save battery/bandwidth
    disableNetwork(db)
      .then(() => console.log('Firestore network disabled due to offline'))
      .catch(err => console.error('Error disabling network:', err))
  })

  // Actions
  const registerUser = async (email, password, displayName) => {
    isLoading.value = true
    error.value = null

    try {
      // First verify if Firebase is reachable
      const isHealthy = await checkFirebaseHealth()
      if (!isHealthy) {
        error.value = 'Unable to connect to authentication service. Please try again later.'
        return null
      }
      
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email, 
        password
      )
      
      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName
      })
      
      // Create a user document in Firestore with free membership by default
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          displayName,
          email,
          membership: 'free',
          postsThisMonth: 0,
          totalPosts: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      } catch (firestoreErr) {
        console.error('Error creating user document:', firestoreErr)
        error.value = 'Account created but profile setup failed. Please try logging in.'
      }
      
      return userCredential.user
    } catch (err) {
      console.error('Registration error:', err)
      error.value = err.message || 'Registration failed. Please try again.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const loginUser = async (email, password) => {
    isLoading.value = true
    error.value = null
    
    try {
      // First verify if Firebase is reachable
      const isHealthy = await checkFirebaseHealth()
      if (!isHealthy) {
        error.value = 'Unable to connect to authentication service. Please try again later.'
        return null
      }
      
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        email, 
        password
      )
      
      // Try to fetch user data, but allow login even if this fails
      try {
        await fetchUserData(userCredential.user.uid)
      } catch (fetchErr) {
        console.warn('Could not fetch user data on login, but authentication succeeded:', fetchErr)
        // Set basic user data from auth
        user.value = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          // Default values for missing data
          membership: 'free',
          postsThisMonth: 0,
          totalPosts: 0
        }
      }
      
      return userCredential.user
    } catch (err) {
      console.error('Login error:', err)
      
      if (err.code === 'auth/network-request-failed') {
        error.value = 'Network error. Please check your internet connection and try again.'
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        error.value = 'Invalid email or password.'
      } else {
        error.value = err.message || 'Login failed. Please check your credentials.'
      }
      
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logoutUser = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      await signOut(auth)
      user.value = null
    } catch (err) {
      console.error('Logout error:', err)
      error.value = err.message || 'Logout failed. Please try again.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchUserData = async (uid) => {
    isLoading.value = true
    error.value = null
    
    try {
      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const userData = docSnap.data()
        user.value = {
          uid,
          email: userData.email,
          displayName: userData.displayName,
          membership: userData.membership,
          postsThisMonth: userData.postsThisMonth,
          totalPosts: userData.totalPosts
        }
        
        return user.value
      } else {
        // No user document found, but authentication succeeded
        // Create a basic profile with default values
        console.warn('User document not found, creating default profile')
        
        if (auth.currentUser) {
          const defaultUserData = {
            displayName: auth.currentUser.displayName || 'User',
            email: auth.currentUser.email,
            membership: 'free',
            postsThisMonth: 0,
            totalPosts: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }
          
          try {
            await setDoc(docRef, defaultUserData)
            user.value = {
              uid,
              ...defaultUserData
            }
            return user.value
          } catch (err) {
            console.error('Error creating default user profile:', err)
            error.value = 'Could not create user profile. Some features may be limited.'
          }
        }
        
        // Fallback with basic user data
        user.value = {
          uid,
          email: auth.currentUser?.email,
          displayName: auth.currentUser?.displayName,
          membership: 'free',
          postsThisMonth: 0,
          totalPosts: 0
        }
        
        return user.value
      }
    } catch (err) {
      console.error('Error fetching user data:', err)
      
      if (err.message?.includes('offline') || err.code === 'failed-precondition') {
        error.value = 'You appear to be offline. Some features may be limited.'
      } else {
        error.value = 'Error loading user data. Please try again later.'
      }
      
      // Still set basic user data from auth if available
      if (auth.currentUser) {
        user.value = {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName,
          membership: 'free',  // Default until we can fetch real data
          postsThisMonth: 0,
          totalPosts: 0
        }
      }
      
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updateUserMembership = async (membershipId) => {
    if (!user.value || !user.value.uid) {
      error.value = 'User not authenticated'
      return
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const userDocRef = doc(db, 'users', user.value.uid)
      await updateDoc(userDocRef, {
        membership: membershipId,
        updatedAt: serverTimestamp()
      })
      
      // Update local user object
      user.value.membership = membershipId
      return user.value
    } catch (err) {
      console.error('Error updating membership:', err)
      error.value = err.message || 'Failed to update membership. Please try again.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const incrementPostCount = async () => {
    if (!user.value || !user.value.uid) {
      error.value = 'User not authenticated'
      return
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      // Update the post count in Firestore
      const userDocRef = doc(db, 'users', user.value.uid)
      await updateDoc(userDocRef, {
        postsThisMonth: (user.value.postsThisMonth || 0) + 1,
        totalPosts: (user.value.totalPosts || 0) + 1,
        updatedAt: serverTimestamp()
      })
      
      // Update local user object
      user.value.postsThisMonth = (user.value.postsThisMonth || 0) + 1
      user.value.totalPosts = (user.value.totalPosts || 0) + 1
      
      return user.value
    } catch (err) {
      console.error('Error incrementing post count:', err)
      error.value = err.message || 'Failed to update post count. Please try again.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Setup auth state listener
  const initAuth = () => {
    // Pre-check Firebase health to ensure auth is working
    checkFirebaseHealth().then(isHealthy => {
      console.log('Firebase health check on init:', isHealthy ? 'healthy' : 'unhealthy')
    })
    
    // Setup auth state change listener
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        try {
          await fetchUserData(firebaseUser.uid)
        } catch (err) {
          console.error('Error in auth state change:', err)
          // Still set basic user data from authentication
          if (!user.value) {
            user.value = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              membership: 'free',  // Default until we can fetch real data
              postsThisMonth: 0,
              totalPosts: 0
            }
          }
        }
      } else {
        // User is signed out
        user.value = null
      }
    })
  }

  return {
    user,
    isLoading,
    error,
    isOffline,
    retryCount,
    membershipPlans,
    isAuthenticated,
    currentMembership,
    postsRemaining,
    registerUser,
    loginUser,
    logoutUser,
    fetchUserData,
    updateUserMembership,
    incrementPostCount,
    initAuth,
    refreshConnection
  }
}) 