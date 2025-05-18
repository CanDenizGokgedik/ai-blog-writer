<template>
  <div class="home">
    <div class="hero-section">
      <div class="hero-content">
        <h1>AI-Powered Blog Writing</h1>
        <p class="hero-subtitle">Create engaging, high-quality content in seconds with the power of artificial intelligence</p>
        <button @click="navigateToCreate" class="primary-btn">
          <span class="btn-icon">✨</span> Create New Post
        </button>
      </div>
      <div class="hero-image">
        <img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" alt="AI Blog Writing" />
      </div>
    </div>

    <div class="section-title">
      <h2>Latest Blog Posts</h2>
      <div class="title-underline"></div>
    </div>

    <div v-if="blogStore.isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading your content...</p>
    </div>

    <div v-else-if="blogStore.error" class="error-container">
      <div class="error-icon">⚠️</div>
      <p>{{ blogStore.error }}</p>
      <button @click="blogStore.fetchPosts" class="secondary-btn">Try Again</button>
    </div>

    <div v-else>
      <div v-if="blogStore.posts.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>No posts yet</h3>
        <p>Start creating your AI-powered blog posts today!</p>
        <button @click="navigateToCreate" class="primary-btn">Create Your First Post</button>
      </div>

      <div v-else class="posts-grid">
        <div v-for="post in blogStore.posts" :key="post.id" class="post-card card">
          <div class="post-content">
            <h3>{{ post.title }}</h3>
            <p class="post-excerpt">{{ truncateContent(post.content) }}</p>
            <div class="post-meta">
              <span class="post-date">{{ formatDate() }}</span>
              <span class="post-tag">AI Generated</span>
            </div>
            <button class="text-btn">Read More →</button>
          </div>
        </div>
      </div>

      <div class="action-container">
        <button @click="navigateToCreate" class="primary-btn">
          <span class="btn-icon">✨</span> Create New Post
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBlogStore } from '../stores/blogStore'

const router = useRouter()
const blogStore = useBlogStore()

onMounted(() => {
  blogStore.fetchPosts()
})

const navigateToCreate = () => {
  router.push('/create')
}

const truncateContent = (content) => {
  if (content.length <= 120) return content
  return content.substring(0, 120) + '...'
}

const formatDate = () => {
  const date = new Date()
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.home {
  width: 100%;
}

/* Hero Section */
.hero-section {
  display: flex;
  align-items: stretch;
  gap: 0;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  width: 100%;
  min-height: 350px;
}

.hero-content {
  flex: 1;
  padding: 2.5rem;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 300px;
}

.hero-content h1 {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-image {
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.hero-section:hover .hero-image img {
  transform: scale(1.05);
}

/* Section Title */
.section-title {
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
}

.section-title h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-color);
  display: inline-block;
  margin-bottom: 0.5rem;
}

.title-underline {
  width: 80px;
  height: 4px;
  background: var(--primary-color);
  margin: 0 auto;
  border-radius: 2px;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(99, 102, 241, 0.3);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: var(--radius-lg);
  margin-bottom: 2rem;
  color: #B91C1C;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  text-align: center;
  margin-bottom: 2rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--light-text);
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.empty-state p {
  color: var(--light-text);
  margin-bottom: 1.5rem;
}

/* Posts Grid */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.post-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.post-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.post-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-color);
}

.post-excerpt {
  color: var(--light-text);
  margin-bottom: 1.5rem;
  line-height: 1.6;
  flex: 1;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.post-date {
  color: var(--light-text);
}

.post-tag {
  background-color: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

/* Buttons */
.primary-btn {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  font-weight: 500;
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.primary-btn:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
}

.secondary-btn {
  padding: 0.75rem 1.5rem;
  background-color: white;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  font-weight: 500;
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  cursor: pointer;
}

.secondary-btn:hover {
  background-color: var(--primary-color);
  color: white;
}

.text-btn {
  background: none;
  color: var(--primary-color);
  font-weight: 500;
  padding: 0;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.text-btn:hover {
  color: var(--primary-hover);
  transform: translateX(4px);
}

.btn-icon {
  font-size: 1.1rem;
}

.action-container {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .posts-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  
  .hero-content {
    padding: 2rem;
  }
}

@media (max-width: 992px) {
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 0.95rem;
  }
  
  .hero-section {
    min-height: 300px;
  }
}

@media (max-width: 820px) {
  .hero-section {
    flex-direction: column;
    max-height: none;
  }
  
  .hero-content {
    padding: 2rem;
    min-width: auto;
    width: 100%;
  }
  
  .hero-content h1 {
    font-size: 1.8rem;
    text-align: center;
  }
  
  .hero-subtitle {
    text-align: center;
  }
  
  .hero-content .primary-btn {
    align-self: center;
  }
  
  .hero-image {
    width: 100%;
    min-height: 200px;
    max-height: 250px;
  }
  
  .posts-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  .section-title h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 600px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }
  
  .post-card {
    max-width: 450px;
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .hero-content {
    padding: 1.5rem;
  }
  
  .hero-content h1 {
    font-size: 1.6rem;
    margin-bottom: 0.75rem;
  }
  
  .hero-subtitle {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }
  
  .hero-image {
    min-height: 180px;
    max-height: 200px;
  }
  
  .primary-btn, .secondary-btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
  
  .post-card h3 {
    font-size: 1.1rem;
  }
  
  .post-excerpt {
    font-size: 0.9rem;
  }
  
  .loading-container, .error-container, .empty-state {
    padding: 1.5rem 1rem;
  }
  
  .empty-icon {
    font-size: 2.5rem;
  }
  
  .section-title {
    margin-bottom: 1.5rem;
  }
}
</style>
