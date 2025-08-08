import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth.store'

export function useAuthError() {
  const router = useRouter()
  const { error, clearError } = useAuthStore()
  
  useEffect(() => {
    if (error) {
      if (error.includes('認証が必要です') || error.includes('Unauthorized')) {
        toast.error('ログインが必要です')
        router.push('/login')
      } else if (error.includes('権限がありません') || error.includes('Forbidden')) {
        toast.error('このアクションを実行する権限がありません')
      } else if (error.includes('セッションの有効期限が切れました')) {
        toast.error('セッションの有効期限が切れました。再度ログインしてください')
        router.push('/login')
      } else {
        toast.error(error)
      }
      
      clearError()
    }
  }, [error, clearError, router])
}