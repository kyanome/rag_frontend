'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { User, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth.store';
import { AuthClient } from '@/lib/auth/client';
import type { APIError } from '@/types/errors';

interface ProfileFormData {
  name: string;
  email: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!isDirty) {
      toast.info('変更がありません');
      return;
    }

    setIsLoading(true);
    try {
      const updatedUser = await AuthClient.updateProfile({
        name: data.name !== user?.name ? data.name : undefined,
        email: data.email !== user?.email ? data.email : undefined,
      });
      
      setUser(updatedUser);
      toast.success('プロフィールを更新しました');
      reset(data); // Reset form with new values to clear isDirty
    } catch (error) {
      console.error('Profile update error:', error);
      let message = 'プロフィールの更新に失敗しました';
      const axiosError = error as APIError;
      if (axiosError.response?.data?.detail) {
        message = axiosError.response.data.detail;
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">プロフィール設定</h1>

      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
          <CardDescription>
            アカウントの基本情報を編集できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="name">
                <User className="inline h-4 w-4 mr-1" />
                名前
              </Label>
              <Input
                id="name"
                type="text"
                {...register('name', {
                  required: '名前は必須です',
                  minLength: {
                    value: 1,
                    message: '名前を入力してください',
                  },
                  maxLength: {
                    value: 255,
                    message: '名前は255文字以内で入力してください',
                  },
                })}
                placeholder="山田 太郎"
                className="mt-1"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">
                <Mail className="inline h-4 w-4 mr-1" />
                メールアドレス
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email', {
                  required: 'メールアドレスは必須です',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: '有効なメールアドレスを入力してください',
                  },
                })}
                placeholder="user@example.com"
                className="mt-1"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm text-gray-600">
              <p>
                <strong>ユーザーID:</strong> {user.id}
              </p>
              <p>
                <strong>ロール:</strong> {user.role}
              </p>
              <p>
                <strong>登録日:</strong> {new Date(user.created_at).toLocaleDateString('ja-JP')}
              </p>
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/profile/password')}
              >
                パスワード変更
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !isDirty}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    更新中...
                  </>
                ) : (
                  '更新'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}