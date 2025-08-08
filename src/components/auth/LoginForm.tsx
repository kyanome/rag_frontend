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
import type { LoginInput } from '@/types/auth'

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
})

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })
  
  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    
    try {
      const response = await AuthClient.login(data)
      
      TokenManager.setTokens(response.tokens)
      
      login(response.user, response.tokens)
      
      toast.success('ログインに成功しました')
      
      router.push('/documents')
    } catch (error) {
      console.error('Login error:', error)
      
      const axiosError = error as { response?: { status: number } }
      if (axiosError.response?.status === 401) {
        toast.error('メールアドレスまたはパスワードが正しくありません')
      } else {
        toast.error('ログインに失敗しました。もう一度お試しください')
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>ログイン</CardTitle>
        <CardDescription>
          RAGシステムにログインしてください
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
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
                ログイン中...
              </>
            ) : (
              'ログイン'
            )}
          </Button>
          
          <p className="text-sm text-center text-muted-foreground">
            アカウントをお持ちでない方は{' '}
            <Link
              href="/register"
              className="text-primary hover:underline"
            >
              新規登録
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}