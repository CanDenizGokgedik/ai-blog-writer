<template>
  <div class="create-post-container">
    <div class="page-header">
      <h1>Create New Blog Post</h1>
      <p class="subtitle">Create engaging, AI-powered content for your audience</p>
    </div>

    <!-- API Status Banner -->
    <div v-if="showAPIError" class="api-status-banner">
      <i class="fas fa-exclamation-triangle"></i>
      <span>Couldn't connect to Groq API - using local content generation instead</span>
      <button @click="retryConnection" class="retry-btn" title="Retry connection">
        <i class="fas fa-sync-alt"></i>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="blogStore.isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <h3>AI is crafting your content...</h3>
        <p>Connecting to Groq API</p>
        <div class="progress-container">
          <div class="progress-bar"></div>
        </div>
      </div>
    </div>

    <div v-else class="content-layout">
      <!-- Editor Form Container -->
      <div class="form-container">
        <form @submit.prevent="createPost" class="post-form">
          <!-- Creation Steps -->
          <div class="creation-steps">
            <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
              <div class="step-number">1</div>
              <div class="step-text">Keywords</div>
            </div>
            <div class="step-connector"></div>
            <div class="step" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
              <div class="step-number">2</div>
              <div class="step-text">Title</div>
            </div>
            <div class="step-connector"></div>
            <div class="step" :class="{ active: currentStep === 3, completed: currentStep > 3 }">
              <div class="step-number">3</div>
              <div class="step-text">Content</div>
            </div>
          </div>

          <!-- Step 1: Keywords -->
          <div v-if="currentStep === 1">
            <div class="form-group">
              <label for="keywords">
                <i class="fas fa-tags label-icon"></i> Primary Keywords
              </label>
              <div class="form-hint">Add your main keywords (2-3) separated by commas</div>
              <input 
                id="primary-keywords" 
                v-model="postData.primaryKeywords" 
                type="text" 
                required 
                placeholder="e.g., artificial intelligence, machine learning"
                class="input-field"
              >
            </div>
            
            <div class="form-group">
              <label for="secondary-keywords">
                <i class="fas fa-tags label-icon"></i> Secondary Keywords
              </label>
              <div class="form-hint">Add additional keywords (3-5) to enhance SEO</div>
              <input 
                id="secondary-keywords" 
                v-model="postData.secondaryKeywords" 
                type="text" 
                placeholder="e.g., future tech, AI development, automation"
                class="input-field"
              >
            </div>
            
            <div class="form-actions">
              <button type="button" @click="generateTitle" class="btn-generate">
                <i class="fas fa-magic"></i> Generate Title
              </button>
            </div>
          </div>
          
          <!-- Step 2: Title -->
          <div v-if="currentStep === 2">
            <div class="form-group">
              <label for="title">
                <i class="fas fa-heading label-icon"></i> Blog Post Title
              </label>
              <div class="form-hint">Choose a clear, attention-grabbing title that includes your primary keywords</div>
              <input 
                id="title" 
                v-model="postData.title" 
                type="text" 
                required 
                placeholder="AI-generated title based on your keywords"
                class="input-field"
              >
            </div>
            
            <!-- Title Suggestions -->
            <div v-if="titleSuggestions.length > 0" class="suggestions-container">
              <h4>Suggested Titles:</h4>
              <div class="suggestions-list">
                <div 
                  v-for="(title, index) in titleSuggestions" 
                  :key="index" 
                  class="suggestion-item"
                  @click="selectTitle(title)"
                >
                  {{ title }}
                </div>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="currentStep = 1" class="btn-secondary">
                <i class="fas fa-arrow-left"></i> Back
              </button>
              <button type="button" @click="generateContent" class="btn-generate">
                <i class="fas fa-magic"></i> Generate Content
              </button>
            </div>
          </div>
          
          <!-- Step 3: Content -->
          <div v-if="currentStep === 3">
            <div class="form-group">
              <label for="content">
                <i class="fas fa-edit label-icon"></i> Content
              </label>
              <div class="editor-container">
                <div class="editor-toolbar">
                  <div class="toolbar-group">
                    <button type="button" class="toolbar-btn" title="Bold" @click="insertHtmlTag('strong')">
                      <i class="fas fa-bold"></i>
                    </button>
                    <button type="button" class="toolbar-btn" title="Italic" @click="insertHtmlTag('em')">
                      <i class="fas fa-italic"></i>
                    </button>
                    <button type="button" class="toolbar-btn" title="Heading" @click="insertHtmlTag('h2')">
                      <i class="fas fa-heading"></i>
                    </button>
                    <button type="button" class="toolbar-btn" title="Paragraph" @click="insertHtmlTag('p')">
                      <i class="fas fa-paragraph"></i>
                    </button>
                    <button type="button" class="toolbar-btn" title="List" @click="insertHtmlTag('li', 'ul')">
                      <i class="fas fa-list-ul"></i>
                    </button>
                    <button type="button" class="toolbar-btn" title="Link" @click="insertHtmlTag('a')">
                      <i class="fas fa-link"></i>
                    </button>
                  </div>
                  <button type="button" @click="regenerateContent" class="toolbar-ai-btn">
                    <i class="fas fa-robot"></i> Regenerate
                  </button>
                </div>
                <textarea 
                  id="content" 
                  v-model="postData.content" 
                  required 
                  placeholder="AI-generated content based on your title and keywords..."
                  class="content-editor"
                  @input="updatePreview"
                ></textarea>
              </div>
              <div class="editor-footer">
                <div class="word-count">
                  <i class="fas fa-font"></i> {{ wordCount }} words
                </div>
                <div class="seo-score">
                  <i class="fas fa-chart-line"></i> SEO Score: {{ seoScore }}%
                </div>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="currentStep = 2" class="btn-secondary">
                <i class="fas fa-arrow-left"></i> Back
              </button>
              <button type="button" @click="saveDraft" class="btn-secondary">
                <i class="fas fa-save"></i> Save Draft
              </button>
              <button type="submit" class="btn-generate">
                <i class="fas fa-paper-plane"></i> Publish Post
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Preview Container -->
      <div class="preview-container">
        <div class="preview-header">
          <h3>Live Preview</h3>
          <div class="preview-actions">
            <button class="preview-btn" :class="{ active: previewMode === 'desktop' }" @click="previewMode = 'desktop'">
              <i class="fas fa-desktop"></i>
            </button>
            <button class="preview-btn" :class="{ active: previewMode === 'tablet' }" @click="previewMode = 'tablet'">
              <i class="fas fa-tablet-alt"></i>
            </button>
            <button class="preview-btn" :class="{ active: previewMode === 'mobile' }" @click="previewMode = 'mobile'">
              <i class="fas fa-mobile-alt"></i>
            </button>
          </div>
        </div>
        <div class="preview-content" :class="previewMode">
          <div class="preview-frame">
            <div class="preview-content-inner">
              <h2>{{ postData.title || 'Your Blog Post Title' }}</h2>
              <div class="preview-meta">
                <span class="preview-date">{{ new Date().toLocaleDateString() }}</span>
                <span class="preview-category">{{ postData.primaryKeywords || 'General' }}</span>
              </div>
              <div class="preview-text blog-content" v-html="formatContent(postData.content) || 'Start writing your content here...'"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBlogStore } from '../stores/blogStore'
import { useUserStore } from '../stores/userStore'
import { generateBlogContent, generateTitleSuggestions } from '../services/groqService'

const router = useRouter()
const blogStore = useBlogStore()
const userStore = useUserStore()
const previewMode = ref('desktop')
const showPreview = ref(true)
const currentStep = ref(1)
const titleSuggestions = ref([])
const seoScore = ref(85) // For demonstration purposes
const isAPIConnected = ref(true) // Assume connected by default

// Check if we're in mock mode (no API key)
const apiKey = import.meta.env.VITE_GROQ_API || import.meta.env.VITE_GROQ_API_KEY
const isMockMode = ref(!apiKey || apiKey.length === 0)

// Log the API configuration status
console.log(`CreatePostView: API key available: ${!!apiKey}`)

// Don't show API connection error if we're deliberately in mock mode
const showAPIError = computed(() => {
  return !isAPIConnected.value && !isMockMode.value
})

const postData = ref({
  title: '',
  primaryKeywords: '',
  secondaryKeywords: '',
  content: ''
})

// Performance optimization - limit how often we calculate word count
const debounce = (fn, delay) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}

const wordCount = computed(() => {
  if (!postData.value.content) return 0
  return postData.value.content.trim().split(/\s+/).length
})

const updatePreview = debounce(() => {
  // Preview is now updated reactively through computed properties
  // This function mainly serves as a debounced event handler
}, 300)

const formatContent = (content) => {
  if (!content) return '';
  
  // If content is already HTML formatted (contains tags), return it as is
  if (content.includes('<h2>') || content.includes('<p>') || content.includes('<strong>')) {
    return content;
  }
  
  // Otherwise, convert markdown to HTML (legacy support)
  return content
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^##\s+(.*)$/gm, '<h2>$1</h2>')
    .replace(/^###\s+(.*)$/gm, '<h3>$1</h3>');
}

const formatPreviewContent = formatContent // alias for backward compatibility

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

// Optimized membership check with caching
const membershipChecked = ref(false)
const checkMembershipLimits = () => {
  // If already checked in this session, don't re-check
  if (membershipChecked.value) return true
  
  // Check if user is authenticated
  if (!userStore.isAuthenticated) {
    alert('Please sign in to create posts')
    router.push('/login')
    return false
  }
  
  // Check if user has posts remaining in their plan
  if (userStore.postsRemaining <= 0) {
    alert(`You've reached the limit of ${userStore.currentMembership.postsPerMonth} posts for your ${userStore.currentMembership.name} plan this month. Please upgrade your membership to create more posts.`)
    router.push('/profile')
    return false
  }
  
  membershipChecked.value = true
  return true
}

const selectTitle = (title) => {
  // Just use the title directly - it's already clean from our template system
  postData.value.title = title;
}

const generateTitle = async () => {
  // Check membership limits
  if (!checkMembershipLimits()) {
    return
  }
  
  if (!postData.value.primaryKeywords) {
    alert('Please enter primary keywords to generate a title')
    return
  }
  
  blogStore.isLoading = true
  
  try {
    console.log('Starting title generation...')
    
    // Get keywords array - split by commas and clean up
    const keywords = postData.value.primaryKeywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k);
    
    // Get title suggestions using our template system
    titleSuggestions.value = await generateTitleSuggestions(keywords);
    isAPIConnected.value = true;
    
    // Set default title
    if (titleSuggestions.value && titleSuggestions.value.length > 0) {
      postData.value.title = titleSuggestions.value[0];
    }
    
    // Move to next step
    currentStep.value = 2;
  } catch (error) {
    console.error('Error generating title:', error);
    
    // Only mark API as disconnected for real connection issues, not mock mode
    if (!error.message?.includes('not configured')) {
      isAPIConnected.value = false;
    }
    
    // Fallback to simple title generation
    const mainKeyword = postData.value.primaryKeywords.split(',')[0]?.trim() || 'Topic';
    
    titleSuggestions.value = [
      `${mainKeyword} Guide`,
      `${mainKeyword} Essentials`,
      `${mainKeyword} Strategies`,
      `${mainKeyword} Overview`,
      `${mainKeyword} Best Practices`
    ];
    
    postData.value.title = titleSuggestions.value[0];
    currentStep.value = 2;
  } finally {
    blogStore.isLoading = false;
  }
}

const generateContent = async () => {
  // Check membership limits
  if (!checkMembershipLimits()) {
    return;
  }
  
  if (!postData.value.title) {
    alert('Please enter a title to generate content');
    return;
  }
  
  blogStore.isLoading = true;
  
  try {
    console.log('Starting content generation with Groq API...');
    
    // Get all keywords
    const primaryKeywords = postData.value.primaryKeywords.split(',').map(k => k.trim()).filter(k => k);
    const secondaryKeywords = postData.value.secondaryKeywords.split(',').map(k => k.trim()).filter(k => k);
    
    // Make sure we have at least one keyword
    if (primaryKeywords.length === 0) {
      alert('Please provide at least one primary keyword');
      blogStore.isLoading = false;
      return;
    }
    
    // Generate content using Groq API
    postData.value.content = await generateBlogContent(
      postData.value.title, 
      primaryKeywords, 
      secondaryKeywords
    );
    
    isAPIConnected.value = true;
    
    // Move to next step
    currentStep.value = 3;
  } catch (error) {
    console.error('Error generating content:', error);
    
    // Only mark API as disconnected for real connection issues, not mock mode
    if (!error.message?.includes('not configured')) {
      isAPIConnected.value = false;
    }
    
    // Fallback to local generation if API fails
    postData.value.content = generateSEOContent(
      postData.value.title, 
      postData.value.primaryKeywords.split(',').map(k => k.trim()), 
      postData.value.secondaryKeywords.split(',').map(k => k.trim())
    );
    currentStep.value = 3;
  } finally {
    blogStore.isLoading = false;
  }
}

const regenerateContent = async () => {
  // Clear cache by modifying title slightly
  const originalTitle = postData.value.title
  postData.value.title = originalTitle + ' '
  await generateContent()
  postData.value.title = originalTitle
}

const generateSEOContent = (title, primaryKeywords, secondaryKeywords) => {
  // This is a placeholder function that generates fallback HTML content
  
  const mainKeyword = primaryKeywords[0] || 'topic';
  const secondKeyword = primaryKeywords[1] || primaryKeywords[0] || 'innovation';
  
  const content = `
    <h2>Introduction to ${title}</h2>
    <p>In today's rapidly evolving landscape, <strong>${mainKeyword}</strong> plays a crucial role in shaping how businesses operate. This comprehensive guide explores how <strong>${secondKeyword}</strong> can transform your approach and drive meaningful results.</p>
    
    <h2>Understanding the Core Concepts</h2>
    <p>Before diving deeper, it's essential to grasp the fundamental principles of ${secondaryKeywords[0] || 'the industry'}. The integration of <strong>${mainKeyword}</strong> with traditional methods has created unprecedented opportunities for growth and efficiency.</p>
    
    <h2>Key Benefits for Businesses</h2>
    <p>Organizations implementing <strong>${secondKeyword}</strong> strategies have reported significant improvements in several areas:</p>
    <ul>
      <li>Enhanced operational efficiency</li>
      <li>Increased customer satisfaction</li>
      <li>Better resource allocation</li>
      <li>Improved decision-making capabilities</li>
    </ul>
    
    <h2>Best Practices for Implementation</h2>
    <p>Successful adoption of ${secondaryKeywords[1] || 'modern solutions'} requires a structured approach. Start by assessing your current capabilities and identifying areas where <strong>${mainKeyword}</strong> can create the most significant impact.</p>
    
    <h2>Common Challenges and Solutions</h2>
    <p>While the benefits are substantial, organizations often encounter obstacles when integrating <strong>${secondKeyword}</strong> into their existing frameworks. These challenges typically include resistance to change, technical limitations, and resource constraints.</p>
    
    <h2>Future Trends and Developments</h2>
    <p>As we look ahead, several emerging trends will shape how <strong>${mainKeyword}</strong> continues to evolve. Staying informed about these developments will be crucial for maintaining a competitive edge in your industry.</p>
  `;
  
  return content;
}

const createPost = async () => {
  // Check membership limits before proceeding
  if (!checkMembershipLimits()) {
    return
  }
  
  try {
    // Create the post
    await blogStore.createPost({
      title: postData.value.title,
      content: postData.value.content,
      primaryKeywords: postData.value.primaryKeywords,
      secondaryKeywords: postData.value.secondaryKeywords
    })
    
    // Increment user's post count
    await userStore.incrementPostCount()
    
    router.push('/')
  } catch (error) {
    alert('Error creating post: ' + (error.message || 'Unknown error'))
  }
}

const saveDraft = () => {
  alert('Draft saved!')
}

const cancelCreate = () => {
  router.push('/')
}

// Add retry connection function
const retryConnection = () => {
  const apiKey = import.meta.env.VITE_GROQ_API || import.meta.env.VITE_GROQ_API_KEY;
  
  if (!apiKey) {
    alert('No Groq API key found. Please add VITE_GROQ_API to your .env file.');
    return;
  }
  
  console.log('Retrying connection to Groq API...');
  isAPIConnected.value = true;
  isMockMode.value = false;
  
  // Clear any cached data by forcing regeneration
  if (postData.value.title) {
    // Slightly modify the title to bypass cache
    postData.value.title = postData.value.title.trim() + ' ';
    setTimeout(() => {
      postData.value.title = postData.value.title.trim();
    }, 100);
  }
  
  alert('Connection reset. Next content generation will use the Groq API. API Key detected: ' + apiKey.substring(0, 4) + '...');
}

// Helper function to insert HTML tags at cursor position
const insertHtmlTag = (tag, wrapperTag = null) => {
  const textarea = document.getElementById('content');
  if (!textarea) return;
  
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = postData.value.content.substring(start, end);
  
  let newText;
  
  if (wrapperTag) {
    // For lists, etc.
    if (selectedText) {
      // If text is selected, wrap each line in the tag
      const lines = selectedText.split('\n').map(line => 
        line.trim() ? `  <${tag}>${line.trim()}</${tag}>` : ''
      ).filter(line => line);
      
      newText = `<${wrapperTag}>\n${lines.join('\n')}\n</${wrapperTag}>`;
    } else {
      // If no text is selected, insert template
      newText = `<${wrapperTag}>\n  <${tag}>Item 1</${tag}>\n  <${tag}>Item 2</${tag}>\n</${wrapperTag}>`;
    }
  } else {
    // For simple tags
    if (tag === 'a') {
      // Special case for links
      newText = `<a href="https://example.com">${selectedText || 'Link text'}</a>`;
    } else {
      newText = `<${tag}>${selectedText || `${tag === 'h2' ? 'Heading' : 'Text'}`}</${tag}>`;
    }
  }
  
  // Insert the new text
  postData.value.content = 
    postData.value.content.substring(0, start) + 
    newText + 
    postData.value.content.substring(end);
  
  // Refocus and update preview
  setTimeout(() => {
    textarea.focus();
    textarea.selectionStart = start + newText.length;
    textarea.selectionEnd = start + newText.length;
    updatePreview();
  }, 0);
}
</script>

<style scoped>
:root {
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --primary-light: #818cf8;
  --primary-dark: #4338ca;
  --secondary: #6b7280;
  --secondary-hover: #4b5563;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --light: #f9fafb;
  --dark: #111827;
  --background: #ffffff;
  --card-bg: #ffffff;
  --text-color: #1f2937;
  --light-text: #6b7280;
  --border-color: #e5e7eb;
  --radius-sm: 0.25rem;
  --radius: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.create-post-container {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 1.5rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--light-text);
  font-size: 1.1rem;
}

.content-layout {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.form-container {
  flex: 3;
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 2rem;
  border: 1px solid var(--border-color);
}

.post-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label-icon {
  color: var(--primary);
}

.form-hint {
  font-size: 0.875rem;
  color: var(--light-text);
  margin-bottom: 0.75rem;
}

.input-field {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 1rem;
  transition: all 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-with-button {
  display: flex;
  gap: 0.5rem;
}

.ai-generate-btn {
  white-space: nowrap;
  padding: 0.75rem 1.25rem;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.ai-generate-btn:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.editor-container {
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background-color: #f9fafb;
  border-bottom: 1px solid var(--border-color);
}

.toolbar-group {
  display: flex;
  gap: 0.25rem;
}

.toolbar-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background-color: var(--border-color);
  color: var(--text-color);
}

.toolbar-ai-btn {
  padding: 0.5rem 1rem;
  background-color: rgba(99, 102, 241, 0.1);
  color: var(--primary);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: var(--radius);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-ai-btn:hover {
  background-color: rgba(99, 102, 241, 0.15);
  transform: translateY(-1px);
}

.content-editor {
  width: 100%;
  min-height: 400px;
  padding: 1rem;
  border: none;
  resize: vertical;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-color);
}

.content-editor:focus {
  outline: none;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  color: var(--light-text);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.word-count, .seo-score {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.btn-primary, .btn-secondary, .btn-generate {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-generate {
  background-color: #6366f1; /* Primary color */
  color: white;
  border: none;
  box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);
  font-size: 1.05rem;
  font-weight: 600;
  padding: 0.9rem 1.75rem;
  position: relative;
  overflow: hidden;
  will-change: transform, background-color, box-shadow;
  transition: transform 0.2s, background-color 0.2s, box-shadow 0.2s;
}

.btn-generate::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
  opacity: 0;
  transition: opacity 0.3s;
}

.btn-generate:hover {
  background-color: #4f46e5; /* Darker shade */
  transform: translateY(-2px);
  box-shadow: 0 6px 12px -2px rgba(79, 70, 229, 0.35);
}

.btn-generate:hover::after {
  opacity: 1;
}

.btn-generate:active {
  transform: translateY(0);
  box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);
}

.btn-secondary {
  background-color: white;
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: var(--light);
  transform: translateY(-1px);
}

/* Preview Container */
.preview-container {
  flex: 2;
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  position: sticky;
  top: 2rem;
  max-height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
}

.preview-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
}

.preview-actions {
  display: flex;
  gap: 0.5rem;
}

.preview-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--light-text);
  cursor: pointer;
  transition: all 0.2s;
}

.preview-btn:hover {
  background-color: var(--light);
}

.preview-btn.active {
  background-color: var(--primary);
  color: white;
  border-color: var(--primary);
}

.preview-content {
  flex: 1;
  overflow: auto;
  padding: 1rem;
  background-color: #f9fafb;
}

.preview-frame {
  background-color: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  padding: 2rem;
  height: 100%;
  contain: content; /* Improve layout performance */
  transform: translateZ(0); /* Force GPU acceleration */
}

.preview-content.tablet .preview-frame {
  max-width: 768px;
  margin: 0 auto;
}

.preview-content.mobile .preview-frame {
  max-width: 375px;
  margin: 0 auto;
}

.preview-content-inner h2 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.preview-meta {
  display: flex;
  gap: 1rem;
  color: var(--light-text);
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.preview-text {
  line-height: 1.7;
  color: var(--text-color);
}

.preview-text h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1.5rem 0 1rem;
}

.preview-text h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1.25rem 0 0.75rem;
}

.preview-text p {
  margin-bottom: 1rem;
}

.preview-text ul {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.preview-text li {
  margin-bottom: 0.5rem;
}

/* Loading State */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(3px);
  will-change: opacity;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.loading-content {
  background-color: white;
  padding: 2rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  text-align: center;
  max-width: 400px;
  will-change: transform;
  animation: slideUp 0.3s ease-out;
  transform: translateZ(0); /* Force GPU acceleration */
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(99, 102, 241, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary);
  margin: 0 auto 1.5rem;
  animation: spin 0.8s linear infinite;
  will-change: transform;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.progress-container {
  height: 6px;
  background-color: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 1.5rem;
  position: relative;
}

.progress-bar {
  height: 100%;
  border-radius: 3px;
  animation: loading-pulse 0.8s ease-in-out infinite, loading-width 1.5s infinite;
  background: linear-gradient(90deg, var(--primary) 30%, var(--primary-light) 50%, var(--primary) 70%);
  background-size: 200% 100%;
  will-change: opacity, background-position;
}

@keyframes loading-pulse {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

@keyframes loading-width {
  0% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-layout {
    flex-direction: column;
  }
  
  .preview-container {
    position: static;
    max-height: none;
    min-height: 500px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .create-post-container {
    margin: 1rem auto;
    padding: 0 1rem;
  }
  
  .page-header {
    margin-bottom: 1.5rem;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .subtitle {
    font-size: 0.95rem;
  }
  
  .form-container, .preview-container {
    padding: 1.5rem;
  }
  
  .content-editor {
    min-height: 300px;
  }
  
  .input-with-button {
    flex-direction: column;
  }
  
  .ai-generate-btn {
    width: 100%;
    justify-content: center;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-primary, .btn-secondary, .btn-generate {
    width: 100%;
    justify-content: center;
  }
  
  .editor-footer {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .create-post-container {
    margin: 0.5rem auto;
    padding: 0 0.75rem;
  }
  
  .form-container, .preview-container {
    padding: 1rem;
    border-radius: var(--radius);
  }
  
  .preview-frame {
    padding: 1rem;
  }
  
  .toolbar-group {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Steps Styles */
.creation-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.step-number {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--light);
  color: var(--secondary);
  font-weight: 600;
  border: 2px solid var(--border-color);
}

.step.active .step-number {
  background-color: var(--primary);
  color: white;
  border-color: var(--primary);
}

.step.completed .step-number {
  background-color: var(--success);
  color: white;
  border-color: var(--success);
}

.step-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--light-text);
}

.step.active .step-text {
  color: var(--primary);
  font-weight: 600;
}

.step.completed .step-text {
  color: var(--success);
}

.step-connector {
  flex: 1;
  height: 2px;
  background-color: var(--border-color);
  margin: 0 1rem;
  margin-bottom: 1.5rem;
}

/* Suggestions Styles */
.suggestions-container {
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  contain: content; /* Improve layout performance */
}

.suggestions-container h4 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--text-color);
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  contain: content; /* Improve layout performance */
}

.suggestion-item {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s, border-color 0.2s;
  will-change: transform, background-color, border-color;
  transform: translateZ(0); /* Force GPU acceleration */
}

.suggestion-item:hover {
  background-color: var(--light);
  border-color: var(--primary-light);
  transform: translateY(-2px);
}

/* SEO Score */
.seo-score {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--success);
  font-weight: 500;
}

/* API Status Banner */
.api-status-banner {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
  border-radius: var(--radius);
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.retry-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: #856404;
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Blog content styling */
:deep(.blog-content h2) {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--dark);
  margin: 1.5rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

:deep(.blog-content p) {
  margin-bottom: 1rem;
  line-height: 1.7;
}

:deep(.blog-content strong) {
  font-weight: 600;
  color: var(--primary-dark);
}

:deep(.blog-content ul),
:deep(.blog-content ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

:deep(.blog-content li) {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

:deep(.blog-content a) {
  color: var(--primary);
  text-decoration: none;
}

:deep(.blog-content a:hover) {
  text-decoration: underline;
}
</style>
