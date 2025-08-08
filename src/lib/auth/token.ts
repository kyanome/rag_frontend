import Cookies from 'js-cookie'
import type { AuthTokens } from '@/types/auth'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const CSRF_TOKEN_KEY = 'csrf_token'

// Token refresh mutex to prevent race conditions
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

export class TokenManager {
  private static tokenCache: { [key: string]: string | undefined } = {}
  
  static setTokens(tokens: AuthTokens): void {
    if (!tokens) {
      console.error('TokenManager.setTokens called with undefined tokens')
      return
    }
    
    const { access_token, refresh_token } = tokens
    
    // Primary storage in cookies (more secure)
    Cookies.set(ACCESS_TOKEN_KEY, access_token, {
      expires: 1,
      sameSite: 'strict', // Changed to strict for better CSRF protection
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    })
    
    Cookies.set(REFRESH_TOKEN_KEY, refresh_token, {
      expires: 7,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    })
    
    // Update cache
    this.tokenCache[ACCESS_TOKEN_KEY] = access_token
    this.tokenCache[REFRESH_TOKEN_KEY] = refresh_token
    
    // Fallback to localStorage only if cookies are disabled
    if (typeof window !== 'undefined' && !navigator.cookieEnabled) {
      try {
        localStorage.setItem(ACCESS_TOKEN_KEY, access_token)
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token)
      } catch (e) {
        console.warn('Failed to store tokens in localStorage:', e)
      }
    }
  }
  
  static generateCSRFToken(): string {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    sessionStorage.setItem(CSRF_TOKEN_KEY, token)
    return token
  }
  
  static getCSRFToken(): string | null {
    return sessionStorage.getItem(CSRF_TOKEN_KEY)
  }
  
  static getAccessToken(): string | undefined {
    // Check cache first
    if (this.tokenCache[ACCESS_TOKEN_KEY]) {
      return this.tokenCache[ACCESS_TOKEN_KEY]
    }
    
    // Try cookies
    const cookieToken = Cookies.get(ACCESS_TOKEN_KEY)
    if (cookieToken) {
      this.tokenCache[ACCESS_TOKEN_KEY] = cookieToken
      return cookieToken
    }
    
    // Fallback to localStorage
    if (typeof window !== 'undefined' && !navigator.cookieEnabled) {
      const localToken = localStorage.getItem(ACCESS_TOKEN_KEY)
      if (localToken) {
        this.tokenCache[ACCESS_TOKEN_KEY] = localToken
        return localToken
      }
    }
    
    return undefined
  }
  
  static getRefreshToken(): string | undefined {
    // Check cache first
    if (this.tokenCache[REFRESH_TOKEN_KEY]) {
      return this.tokenCache[REFRESH_TOKEN_KEY]
    }
    
    const cookieToken = Cookies.get(REFRESH_TOKEN_KEY)
    if (cookieToken) {
      this.tokenCache[REFRESH_TOKEN_KEY] = cookieToken
      return cookieToken
    }
    
    if (typeof window !== 'undefined' && !navigator.cookieEnabled) {
      const localToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (localToken) {
        this.tokenCache[REFRESH_TOKEN_KEY] = localToken
        return localToken
      }
    }
    
    return undefined
  }
  
  static clearTokens(): void {
    // Clear all storage
    Cookies.remove(ACCESS_TOKEN_KEY, { path: '/' })
    Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' })
    
    // Clear cache
    this.tokenCache = {}
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem('auth-storage')
      sessionStorage.removeItem(CSRF_TOKEN_KEY)
    }
  }
  
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expirationTime = payload.exp * 1000
      // Add 30 second buffer to prevent edge cases
      return Date.now() >= (expirationTime - 30000)
    } catch {
      return true
    }
  }
  
  // Refresh token mutex methods
  static subscribeTokenRefresh(callback: (token: string) => void): void {
    refreshSubscribers.push(callback)
  }
  
  static onTokenRefreshed(token: string): void {
    refreshSubscribers.forEach(callback => callback(token))
    refreshSubscribers = []
  }
  
  static setRefreshingState(state: boolean): void {
    isRefreshing = state
  }
  
  static isCurrentlyRefreshing(): boolean {
    return isRefreshing
  }
}
EOF < /dev/null