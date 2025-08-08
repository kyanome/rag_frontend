'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { AuthClient } from '@/lib/auth/client'
import { TokenManager } from '@/lib/auth/token'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setTokens, setLoading, logout } = useAuthStore()
  
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)
      
      try {
        const accessToken = TokenManager.getAccessToken()
        const refreshToken = TokenManager.getRefreshToken()
        
        if (accessToken && refreshToken) {
          const isExpired = TokenManager.isTokenExpired(accessToken)
          
          if (isExpired) {
            try {
              const newTokens = await AuthClient.refreshToken(refreshToken)
              TokenManager.setTokens(newTokens)
              setTokens(newTokens)
            } catch {
              logout()
              TokenManager.clearTokens()
              return
            }
          }
          
          try {
            const user = await AuthClient.getCurrentUser()
            setUser(user)
          } catch {
            logout()
            TokenManager.clearTokens()
          }
        } else {
          logout()
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        logout()
      } finally {
        setLoading(false)
      }
    }
    
    initAuth()
  }, [setUser, setTokens, setLoading, logout])
  
  return <>{children}</>
}