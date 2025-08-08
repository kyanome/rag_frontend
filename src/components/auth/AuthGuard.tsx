'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function AuthGuard({ 
  children, 
  requireAuth = true,
  redirectTo = '/login' 
}: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useAuthStore()
  
  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        const redirectUrl = new URL(redirectTo, window.location.origin)
        redirectUrl.searchParams.set('from', pathname)
        router.push(redirectUrl.toString())
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router, redirectTo, pathname])
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">認証情報を確認中...</p>
        </div>
      </div>
    )
  }
  
  if (requireAuth && !isAuthenticated) {
    return null
  }
  
  return <>{children}</>
}