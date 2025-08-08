'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { AuthClient } from '@/lib/auth/client'
import { TokenManager } from '@/lib/auth/token'
import { useAccessibleToast } from '@/components/ui/toast-accessible'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setTokens, setLoading, logout, setError, clearError } = useAuthStore()
  const [initComplete, setInitComplete] = useState(false)
  
  // Initialize accessible toast
  useAccessibleToast()
  
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)
      clearError()
      
      try {
        // Generate CSRF token on app load
        if (typeof window !== 'undefined') {
          TokenManager.generateCSRFToken()
        }
        
        const accessToken = TokenManager.getAccessToken()
        const refreshToken = TokenManager.getRefreshToken()
        
        if (accessToken && refreshToken) {
          // Check if token is expired
          const isExpired = TokenManager.isTokenExpired(accessToken)
          
          if (isExpired) {
            try {
              // Use the improved refresh logic
              const newTokens = await AuthClient.refreshToken(refreshToken)
              TokenManager.setTokens(newTokens)
              setTokens(newTokens)
              
              // Get user info with new token
              const user = await AuthClient.getCurrentUser()
              setUser(user)
            } catch (error) {
              console.error('Token refresh failed:', error)
              logout()
              TokenManager.clearTokens()
            }
          } else {
            // Token still valid, get user info
            try {
              const user = await AuthClient.getCurrentUser()
              setUser(user)
              setTokens({ access_token: accessToken, refresh_token: refreshToken, token_type: 'bearer' })
            } catch (error) {
              console.error('Failed to get user info:', error)
              // Try to refresh token
              try {
                const newTokens = await AuthClient.refreshToken(refreshToken)
                TokenManager.setTokens(newTokens)
                setTokens(newTokens)
                
                const user = await AuthClient.getCurrentUser()
                setUser(user)
              } catch (refreshError) {
                logout()
                TokenManager.clearTokens()
              }
            }
          }
        } else {
          // No tokens found, ensure clean state
          logout()
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setError('認証の初期化に失敗しました')
        logout()
      } finally {
        setLoading(false)
        setInitComplete(true)
      }
    }
    
    // Only run once on mount
    if (!initComplete) {
      initAuth()
    }
  }, [setUser, setTokens, setLoading, logout, setError, clearError, initComplete])
  
  // Handle visibility change (tab focus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Check token validity when tab becomes visible
        const accessToken = TokenManager.getAccessToken()
        if (accessToken && TokenManager.isTokenExpired(accessToken)) {
          // Token expired while tab was inactive
          const refreshToken = TokenManager.getRefreshToken()
          if (refreshToken) {
            AuthClient.refreshToken(refreshToken).catch(() => {
              logout()
              TokenManager.clearTokens()
            })
          }
        }
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [logout])
  
  return <>{children}</>
}
EOF < /dev/null