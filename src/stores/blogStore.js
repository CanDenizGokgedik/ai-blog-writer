import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useUserStore } from './userStore'

export const useBlogStore = defineStore('blog', () => {
  const posts = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Get all posts or posts for specific user
  const fetchPosts = async (userId = null) => {
    isLoading.value = true
    error.value = null
    
    try {
      let q
      
      if (userId) {
        // Get posts for specific user
        q = query(
          collection(db, 'posts'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        )
      } else {
        // Get all posts
        q = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc')
        )
      }
      
      const querySnapshot = await getDocs(q)
      
      // Map the documents to our posts array
      posts.value = querySnapshot.docs.map(doc => {
        return {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date()
        }
      })
      
      return posts.value
    } catch (err) {
      console.error('Error fetching posts:', err)
      error.value = 'Failed to load posts: ' + (err.message || 'Unknown error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Create a new post
  const createPost = async (postData) => {
    isLoading.value = true
    error.value = null
    
    try {
      const userStore = useUserStore()
      
      if (!userStore.isAuthenticated) {
        throw new Error('You must be logged in to create a post')
      }
      
      // Check if user has reached their post limit
      if (userStore.postsRemaining <= 0) {
        throw new Error('You have reached your monthly post limit')
      }
      
      const newPost = {
        title: postData.title,
        content: postData.content,
        userId: userStore.user.uid,
        author: userStore.user.displayName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, 'posts'), newPost)
      
      // Add to local posts array
      posts.value.unshift({
        id: docRef.id,
        ...newPost,
        createdAt: new Date()
      })
      
      return docRef.id
    } catch (err) {
      console.error('Error creating post:', err)
      error.value = 'Failed to create post: ' + (err.message || 'Unknown error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Delete a post
  const deletePost = async (postId) => {
    isLoading.value = true
    error.value = null
    
    try {
      const userStore = useUserStore()
      
      // Find the post first to verify ownership
      const postToDelete = posts.value.find(post => post.id === postId)
      
      if (!postToDelete) {
        throw new Error('Post not found')
      }
      
      // Check if user is the author of this post
      if (postToDelete.userId !== userStore.user.uid) {
        throw new Error('You can only delete your own posts')
      }
      
      await deleteDoc(doc(db, 'posts', postId))
      
      // Remove from local array
      posts.value = posts.value.filter(post => post.id !== postId)
      
      return true
    } catch (err) {
      console.error('Error deleting post:', err)
      error.value = 'Failed to delete post: ' + (err.message || 'Unknown error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    posts,
    isLoading,
    error,
    fetchPosts,
    createPost,
    deletePost
  }
})
