<template>
  <div class="about">
    <div class="page-header">
      <h1>About AI Blog Writer</h1>
      <div class="title-underline"></div>
    </div>

    <div class="about-sections">
      <div class="card about-intro">
        <div class="about-content">
          <h2>Revolutionizing Content Creation</h2>
          <p>
            AI Blog Writer is a powerful tool that helps content creators generate high-quality
            blog posts using artificial intelligence. Our platform makes it easy to create
            engaging content in minutes rather than hours.
          </p>
          <p>
            Whether you're a professional blogger, content marketer, or business owner,
            our AI-powered writing assistant can help you create compelling content
            that resonates with your audience.
          </p>
        </div>
        <div class="about-image">
          <img src="https://images.unsplash.com/photo-1522542550221-31fd19575a2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" alt="AI Writing" />
        </div>
      </div>

      <div class="features-section">
        <h2>Key Features</h2>
        <div class="title-underline"></div>
        
        <div class="features-grid">
          <div class="feature-card card">
            <div class="feature-icon">✨</div>
            <h3>AI-powered Content</h3>
            <p>Generate high-quality blog posts with advanced AI technology</p>
          </div>
          
          <div class="feature-card card">
            <div class="feature-icon">🔍</div>
            <h3>Topic Research</h3>
            <p>Get intelligent topic suggestions and research assistance</p>
          </div>
          
          <div class="feature-card card">
            <div class="feature-icon">📈</div>
            <h3>SEO Optimization</h3>
            <p>Optimize your content for search engines automatically</p>
          </div>
          
          <div class="feature-card card">
            <div class="feature-icon">✓</div>
            <h3>Grammar Checking</h3>
            <p>Ensure error-free content with advanced grammar checking</p>
          </div>
          
          <div class="feature-card card">
            <div class="feature-icon">📝</div>
            <h3>Style Assistance</h3>
            <p>Maintain consistent tone and style across all your content</p>
          </div>
          
          <div class="feature-card card">
            <div class="feature-icon">🚀</div>
            <h3>Publishing Tools</h3>
            <p>Easily publish and manage your content from one platform</p>
          </div>
        </div>
      </div>

      <div class="cta-section card">
        <h2>Ready to Transform Your Content?</h2>
        <p>Start creating AI-powered blog posts today and save hours of writing time.</p>
        <router-link to="/create" class="primary-btn">
          <span class="btn-icon">✨</span> Start Writing Now
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about {
  width: 100%;
}

.page-header {
  margin-bottom: 3rem;
  text-align: center;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.75rem;
}

.title-underline {
  width: 80px;
  height: 4px;
  background: var(--primary-color);
  margin: 0 auto;
  border-radius: 2px;
}

.about-sections {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

/* About Intro Section */
.about-intro {
  display: flex;
  gap: 3rem;
  padding: 0;
  overflow: hidden;
}

.about-content {
  flex: 1;
  padding: 3rem;
}

.about-content h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1.5rem;
}

.about-content p {
  margin-bottom: 1.5rem;
  line-height: 1.8;
  color: var(--text-color);
}

.about-image {
  flex: 1;
  min-height: 400px;
  overflow: hidden;
}

.about-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.about-intro:hover .about-image img {
  transform: scale(1.05);
}

/* Features Section */
.features-section {
  text-align: center;
}

.features-section h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.75rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature-card {
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-10px);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1.25rem;
  color: var(--primary-color);
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.feature-card p {
  color: var(--light-text);
  line-height: 1.6;
}

/* CTA Section */
.cta-section {
  text-align: center;
  padding: 3rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  color: white;
}

.cta-section h2 {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.cta-section p {
  margin-bottom: 2rem;
  font-size: 1.1rem;
  opacity: 0.9;
}

.cta-section .primary-btn {
  background-color: white;
  color: var(--primary-color);
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  text-decoration: none;
}

.cta-section .primary-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .features-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 992px) {
  .about-content h2 {
    font-size: 1.5rem;
  }
  
  .features-section h2 {
    font-size: 1.5rem;
  }
  
  .feature-card {
    padding: 1.5rem;
  }
  
  .feature-icon {
    font-size: 2rem;
  }
  
  .cta-section h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }
  
  .about-intro {
    flex-direction: column;
  }
  
  .about-content {
    padding: 2rem;
  }
  
  .about-image {
    min-height: 250px;
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  .cta-section {
    padding: 2.5rem 2rem;
  }
}

@media (max-width: 600px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .page-header {
    margin-bottom: 2rem;
  }
  
  .page-header h1 {
    font-size: 1.75rem;
  }
  
  .about-content {
    padding: 1.5rem;
  }
  
  .about-content h2 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }
  
  .about-content p {
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
  
  .about-image {
    min-height: 200px;
  }
  
  .features-section h2 {
    font-size: 1.3rem;
  }
  
  .feature-card {
    padding: 1.25rem;
  }
  
  .feature-icon {
    font-size: 1.75rem;
    margin-bottom: 1rem;
  }
  
  .feature-card h3 {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }
  
  .feature-card p {
    font-size: 0.9rem;
  }
  
  .cta-section {
    padding: 2rem 1.5rem;
  }
  
  .cta-section h2 {
    font-size: 1.3rem;
  }
  
  .cta-section p {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }
  
  .cta-section .primary-btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
}
</style>
