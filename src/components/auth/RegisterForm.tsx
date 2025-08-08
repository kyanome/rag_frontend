'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

import { useAuthStore } from '@/stores/auth.store'
import { AuthClient } from '@/lib/auth/client'
import { TokenManager } from '@/lib/auth/token'
import type { RegisterInput } from '@/types/auth'

const registerSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  name: z.string().min(1, '名前を入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
  password_confirmation: z.string().min(6, '確認用パスワードを入力してください'),
}).refine(data => data.password === data.password_confirmation, {
  message: 'パスワードが一致しません',
  path: ['password_confirmation'],
})

export function RegisterForm() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })
  
  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    
    try {
      const response = await AuthClient.register(data)
      
      if (response?.tokens) {
        TokenManager.setTokens(response.tokens)
        login(response.user, response.tokens)
        toast.success('アカウントを作成しました')
        router.push('/documents')
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error('Registration error:', error)
      
      const axiosError = error as { response?: { status: number; data?: { detail?: string } } }
      if (axiosError.response?.status === 400) {
        const detail = axiosError.response?.data?.detail
        if (detail?.includes('already exists')) {
          toast.error('このメールアドレスは既に登録されています')
        } else {
          toast.error(detail || '登録に失敗しました')
        }
      } else {
        toast.error('登録に失敗しました。もう一度お試しください')
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>新規登録</CardTitle>
        <CardDescription>
          RAGシステムのアカウントを作成します
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">名前</Label>
            <Input
              id="name"
              type="text"
              placeholder="山田 太郎"
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password_confirmation">パスワード（確認）</Label>
            <Input
              id="password_confirmation"
              type="password"
              placeholder="••••••••"
              {...register('password_confirmation')}
              disabled={isLoading}
            />
            {errors.password_confirmation && (
              <p className="text-sm text-red-500">{errors.password_confirmation.message}</p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                登録中...
              </>
            ) : (
              'アカウント作成'
            )}
          </Button>
          
          <p className="text-sm text-center text-muted-foreground">
            既にアカウントをお持ちの方は{' '}
            <Link
              href="/login"
              className="text-primary hover:underline"
            >
              ログイン
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}