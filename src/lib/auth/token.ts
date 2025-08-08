import Cookies from 'js-cookie'
import type { AuthTokens } from '@/types/auth'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export class TokenManager {
  static setTokens(tokens: AuthTokens): void {
    if (!tokens) {
      console.error('TokenManager.setTokens called with undefined tokens')
      return
    }
    
    const { access_token, refresh_token } = tokens
    
    Cookies.set(ACCESS_TOKEN_KEY, access_token, {
      expires: 1,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })
    
    Cookies.set(REFRESH_TOKEN_KEY, refresh_token, {
      expires: 7,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, access_token)
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token)
    }
  }
  
  static getAccessToken(): string | undefined {
    const cookieToken = Cookies.get(ACCESS_TOKEN_KEY)
    if (cookieToken) return cookieToken
    
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ACCESS_TOKEN_KEY) || undefined
    }
    
    return undefined
  }
  
  static getRefreshToken(): string | undefined {
    const cookieToken = Cookies.get(REFRESH_TOKEN_KEY)
    if (cookieToken) return cookieToken
    
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REFRESH_TOKEN_KEY) || undefined
    }
    
    return undefined
  }
  
  static clearTokens(): void {
    Cookies.remove(ACCESS_TOKEN_KEY)
    Cookies.remove(REFRESH_TOKEN_KEY)
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem('auth-storage')
    }
  }
  
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expirationTime = payload.exp * 1000
      return Date.now() >= expirationTime
    } catch {
      return true
    }
  }
}