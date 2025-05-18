<template>
  <div class="profile-container">
    <div class="page-header">
      <h1>Your Account</h1>
      <p class="subtitle">Manage your account and subscription</p>
    </div>
    
    <div v-if="!userStore.isAuthenticated" class="auth-message">
      <p>Please <router-link to="/login">sign in</router-link> to view your profile</p>
    </div>
    
    <div v-else class="profile-content">
      <div class="profile-section card">
        <div class="section-header">
          <h2>Profile Information</h2>
          <button class="btn-secondary" @click="editingProfile = !editingProfile">
            <span v-if="!editingProfile">Edit</span>
            <span v-else>Cancel</span>
          </button>
        </div>
        
        <div v-if="!editingProfile" class="profile-details">
          <div class="profile-item">
            <span class="label">Name</span>
            <span class="value">{{ userStore.user.displayName }}</span>
          </div>
          <div class="profile-item">
            <span class="label">Email</span>
            <span class="value">{{ userStore.user.email }}</span>
          </div>
          <div class="profile-item">
            <span class="label">Member Since</span>
            <span class="value">{{ memberSince }}</span>
          </div>
        </div>
        
        <form v-else @submit.prevent="updateProfile" class="profile-form">
          <div class="form-group">
            <label for="displayName">Name</label>
            <input 
              type="text" 
              id="displayName" 
              v-model="formData.displayName" 
              class="form-input"
            >
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
      
      <div class="profile-section card">
        <div class="section-header">
          <h2>Membership</h2>
        </div>
        
        <div class="membership-details">
          <div class="current-plan">
            <div class="plan-badge">
              {{ userStore.currentMembership.name }}
            </div>
            
            <div class="plan-details">
              <h3>Your Current Plan</h3>
              <p>You can create <strong>{{ userStore.currentMembership.postsPerMonth }}</strong> blog posts per month.</p>
              <p>You have <strong>{{ userStore.postsRemaining }}</strong> posts remaining this month.</p>
            </div>
          </div>
          
          <div class="upgrade-section">
            <h3>Upgrade Your Plan</h3>
            <div class="plan-options">
              <div 
                v-for="plan in userStore.membershipPlans" 
                :key="plan.id"
                :class="['plan-card', { 'current': plan.id === userStore.user.membership }]"
                @click="selectPlan(plan.id)"
              >
                <div class="plan-header">
                  <h4>{{ plan.name }}</h4>
                  <div class="plan-price">
                    <span class="price">{{ plan.price === 0 ? 'Free' : `$${plan.price}` }}</span>
                    <span v-if="plan.price > 0" class="period">/month</span>
                  </div>
                </div>
                
                <div class="plan-features">
                  <div class="feature">
                    <span class="feature-value">{{ plan.postsPerMonth === Infinity ? 'Unlimited' : plan.postsPerMonth }}</span>
                    <span class="feature-name">posts per month</span>
                  </div>
                  
                  <button 
                    v-if="plan.id !== userStore.user.membership"
                    class="btn-select-plan"
                  >
                    {{ plan.price === 0 ? 'Select' : 'Upgrade' }}
                  </button>
                  <div v-else class="current-plan-label">Current Plan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="profile-section card">
        <div class="section-header">
          <h2>Usage Statistics</h2>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ userStore.user.postsThisMonth || 0 }}</div>
            <div class="stat-label">Posts This Month</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ userStore.user.totalPosts || 0 }}</div>
            <div class="stat-label">Total Posts Created</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ userStore.postsRemaining }}</div>
            <div class="stat-label">Remaining Posts</div>
          </div>
        </div>
      </div>
      
      <div class="profile-section card danger-zone">
        <div class="section-header">
          <h2>Account Actions</h2>
        </div>
        
        <div class="danger-actions">
          <button class="btn-danger" @click="confirmLogout">
            <i class="fas fa-sign-out-alt"></i> Logout
          </button>
          
          <button class="btn-danger" @click="confirmDeleteAccount">
            <i class="fas fa-trash-alt"></i> Delete Account
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const userStore = useUserStore()
const editingProfile = ref(false)

const formData = ref({
  displayName: ''
})

// Initialize form data when user data is available
onMounted(() => {
  if (userStore.user) {
    formData.value.displayName = userStore.user.displayName || ''
  }
})

const memberSince = computed(() => {
  // In a real app, you'd use the user's createdAt timestamp
  // For now we'll just return a static date
  return new Date().toLocaleDateString()
})

const updateProfile = async () => {
  // This would update the user's profile in Firebase
  // For now we'll just log it
  console.log('Updating profile:', formData.value)
  
  // Placeholder for actual update logic
  userStore.user.displayName = formData.value.displayName
  
  editingProfile.value = false
}

const selectPlan = async (planId) => {
  try {
    // Don't select the plan they already have
    if (planId === userStore.user.membership) return
    
    // Confirmation dialog for paid plans
    const plan = userStore.membershipPlans.value.find(p => p.id === planId)
    if (plan.price > 0) {
      const confirmed = confirm(`Are you sure you want to upgrade to the ${plan.name} plan for $${plan.price}/month?`)
      if (!confirmed) return
    }
    
    // In a real app, this would integrate with a payment processor for paid plans
    await userStore.updateUserMembership(planId)
    
    // Show success message
    alert(`Successfully ${plan.price > 0 ? 'upgraded to' : 'switched to'} the ${plan.name} plan!`)
  } catch (error) {
    console.error('Failed to update membership:', error)
  }
}

const confirmLogout = async () => {
  try {
    await userStore.logoutUser()
    router.push('/login')
  } catch (error) {
    console.error('Failed to logout:', error)
  }
}

const confirmDeleteAccount = () => {
  const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.')
  if (confirmed) {
    // This would delete the user's account in Firebase
    alert('Account deletion is not implemented in this demo.')
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.subtitle {
  color: #6b7280;
  font-size: 1.1rem;
}

.auth-message {
  text-align: center;
  padding: 3rem 1rem;
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
}

.auth-message a {
  color: #6366f1;
  text-decoration: none;
  font-weight: 500;
}

.auth-message a:hover {
  text-decoration: underline;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-section {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background-color: white;
  color: #4b5563;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.profile-item .label {
  font-size: 0.875rem;
  color: #6b7280;
}

.profile-item .value {
  font-size: 1rem;
  color: #1f2937;
  font-weight: 500;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  color: #6b7280;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background-color: #4f46e5;
}

.membership-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.current-plan {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.plan-badge {
  background-color: #6366f1;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.875rem;
  height: fit-content;
}

.plan-details h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.plan-details p {
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.upgrade-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
}

.plan-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.plan-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.plan-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.plan-card.current {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px #818cf8;
}

.plan-header {
  padding: 1rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.plan-header h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.plan-price {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.plan-price .price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.plan-price .period {
  font-size: 0.875rem;
  color: #6b7280;
}

.plan-features {
  padding: 1rem;
}

.feature {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.feature-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.feature-name {
  font-size: 0.875rem;
  color: #6b7280;
}

.btn-select-plan {
  width: 100%;
  padding: 0.5rem;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-select-plan:hover {
  background-color: #4f46e5;
}

.current-plan-label {
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6366f1;
  padding: 0.5rem;
  background-color: rgba(99, 102, 241, 0.1);
  border-radius: 0.375rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  padding: 1.5rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.danger-zone {
  border-color: #fee2e2;
}

.danger-actions {
  display: flex;
  gap: 1rem;
}

.btn-danger {
  padding: 0.75rem 1.5rem;
  background-color: white;
  color: #ef4444;
  border: 1px solid #ef4444;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-danger:hover {
  background-color: #ef4444;
  color: white;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }
  
  .current-plan {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .plan-options {
    grid-template-columns: 1fr;
  }
  
  .danger-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .profile-container {
    padding: 1rem 0.5rem;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style> 