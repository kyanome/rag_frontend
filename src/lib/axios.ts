import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { TokenManager } from './auth/token'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Rate limiting
const requestQueue: { [key: string]: number } = {}
const RATE_LIMIT_WINDOW = 1000 // 1 second
const MAX_REQUESTS_PER_WINDOW = 10

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request interceptor with rate limiting and CSRF
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Rate limiting check
    const now = Date.now()
    const endpoint = `${config.method}:${config.url}`
    
    if (!requestQueue[endpoint]) {
      requestQueue[endpoint] = 0
    }
    
    // Clean old entries
    Object.keys(requestQueue).forEach(key => {
      if (requestQueue[key] < now - RATE_LIMIT_WINDOW) {
        delete requestQueue[key]
      }
    })
    
    // Check rate limit
    const recentRequests = Object.values(requestQueue).filter(
      time => time > now - RATE_LIMIT_WINDOW
    ).length
    
    if (recentRequests >= MAX_REQUESTS_PER_WINDOW) {
      return Promise.reject(new Error('Rate limit exceeded. Please slow down.'))
    }
    
    requestQueue[endpoint] = now
    
    // Add auth token
    const tokens = useAuthStore.getState().tokens
    if (tokens?.access_token && config.headers) {
      config.headers.Authorization = `Bearer ${tokens.access_token}`
    }
    
    // Add CSRF token for state-changing requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase() || '')) {
      const csrfToken = TokenManager.getCSRFToken()
      if (csrfToken && config.headers) {
        config.headers['X-CSRF-Token'] = csrfToken
      }
    }
    
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor with improved refresh logic
let refreshPromise: Promise<any> | null = null

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
      _retryCount?: number
    }
    
    // Network error handling with retry
    if (!error.response && originalRequest) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1
      
      if (originalRequest._retryCount <= 3) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, originalRequest._retryCount - 1), 10000)
        await new Promise(resolve => setTimeout(resolve, delay))
        
        console.log(`Retrying request (attempt ${originalRequest._retryCount}/3)...`)
        return axiosInstance(originalRequest)
      }
      
      // After 3 retries, show offline message
      useAuthStore.getState().setError('ネットワーク接続を確認してください')
      return Promise.reject(error)
    }
    
    // Handle 401 with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const tokens = useAuthStore.getState().tokens
      if (tokens?.refresh_token) {
        // If already refreshing, wait for it
        if (TokenManager.isCurrentlyRefreshing()) {
          return new Promise((resolve) => {
            TokenManager.subscribeTokenRefresh((newToken: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`
              }
              resolve(axiosInstance(originalRequest))
            })
          })
        }
        
        // Start refresh process
        TokenManager.setRefreshingState(true)
        
        if (!refreshPromise) {
          refreshPromise = axios.post(
            `${API_BASE_URL}/api/v1/auth/refresh`,
            { refresh_token: tokens.refresh_token }
          ).finally(() => {
            refreshPromise = null
            TokenManager.setRefreshingState(false)
          })
        }
        
        try {
          const response = await refreshPromise
          const newTokens = response.data.tokens || response.data
          
          // Update tokens
          useAuthStore.getState().setTokens(newTokens)
          TokenManager.setTokens(newTokens)
          
          // Notify subscribers
          TokenManager.onTokenRefreshed(newTokens.access_token)
          
          // Retry original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`
          }
          
          return axiosInstance(originalRequest)
        } catch (refreshError) {
          // Refresh failed, logout user
          useAuthStore.getState().logout()
          TokenManager.clearTokens()
          
          // Only redirect if we're in the browser
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          
          return Promise.reject(refreshError)
        }
      }
    }
    
    // Handle rate limiting from server
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after']
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000
      
      console.warn(`Rate limited by server. Retrying after ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
      
      return axiosInstance(originalRequest)
    }
    
    return Promise.reject(error)
  }
)

// Network status monitoring
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Network connection restored')
    useAuthStore.getState().clearError()
  })
  
  window.addEventListener('offline', () => {
    console.log('Network connection lost')
    useAuthStore.getState().setError('インターネット接続が失われました')
  })
}

export default axiosInstance
EOF < /dev/null
