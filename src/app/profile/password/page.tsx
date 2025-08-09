'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthClient } from '@/lib/auth/client';
import Link from 'next/link';
import type { APIError } from '@/types/errors';

interface PasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function PasswordChangePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<PasswordFormData>();

  const newPassword = watch('new_password');

  // パスワード強度チェック
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    const checks = [
      { regex: /.{8,}/, text: '8文字以上' },
      { regex: /[A-Z]/, text: '大文字を含む' },
      { regex: /[a-z]/, text: '小文字を含む' },
      { regex: /[0-9]/, text: '数字を含む' },
      { regex: /[^A-Za-z0-9]/, text: '記号を含む' },
    ];

    const passedChecks = checks.filter(check => check.regex.test(password));
    strength = passedChecks.length;

    let strengthText = '';
    let color = '';
    
    if (strength <= 2) {
      strengthText = '弱い';
      color = 'text-red-500';
    } else if (strength <= 3) {
      strengthText = '普通';
      color = 'text-yellow-500';
    } else if (strength <= 4) {
      strengthText = '強い';
      color = 'text-blue-500';
    } else {
      strengthText = 'とても強い';
      color = 'text-green-500';
    }

    return { strength, text: strengthText, color, checks, passedChecks };
  };

  const passwordStrength = getPasswordStrength(newPassword || '');

  const onSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      await AuthClient.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      
      toast.success('パスワードを変更しました');
      reset();
      router.push('/profile');
    } catch (error) {
      console.error('Password change error:', error);
      let message = 'パスワードの変更に失敗しました';
      const axiosError = error as APIError;
      if (axiosError.response?.data?.detail) {
        message = axiosError.response.data.detail;
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/profile" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-1" />
          プロフィールに戻る
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">パスワード変更</h1>

      <Card>
        <CardHeader>
          <CardTitle>新しいパスワードを設定</CardTitle>
          <CardDescription>
            セキュリティのため、定期的にパスワードを変更することをお勧めします
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="current_password">
                <Lock className="inline h-4 w-4 mr-1" />
                現在のパスワード
              </Label>
              <div className="relative mt-1">
                <Input
                  id="current_password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  {...register('current_password', {
                    required: '現在のパスワードを入力してください',
                    minLength: {
                      value: 8,
                      message: 'パスワードは8文字以上である必要があります',
                    },
                  })}
                  placeholder="現在のパスワード"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.current_password && (
                <p className="text-sm text-red-600 mt-1">{errors.current_password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="new_password">
                <Lock className="inline h-4 w-4 mr-1" />
                新しいパスワード
              </Label>
              <div className="relative mt-1">
                <Input
                  id="new_password"
                  type={showNewPassword ? 'text' : 'password'}
                  {...register('new_password', {
                    required: '新しいパスワードを入力してください',
                    minLength: {
                      value: 8,
                      message: 'パスワードは8文字以上である必要があります',
                    },
                    validate: (value) =>
                      value !== watch('current_password') ||
                      '新しいパスワードは現在のパスワードと異なる必要があります',
                  })}
                  placeholder="新しいパスワード"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.new_password && (
                <p className="text-sm text-red-600 mt-1">{errors.new_password.message}</p>
              )}
              
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span>パスワード強度:</span>
                    <span className={`font-medium ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {passwordStrength.checks?.map((check, index) => {
                      const passed = passwordStrength.passedChecks?.includes(check);
                      return (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {passed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-300" />
                          )}
                          <span className={passed ? 'text-green-700' : 'text-gray-500'}>
                            {check.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirm_password">
                <Lock className="inline h-4 w-4 mr-1" />
                新しいパスワード（確認）
              </Label>
              <div className="relative mt-1">
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirm_password', {
                    required: 'パスワードを再入力してください',
                    validate: (value) =>
                      value === watch('new_password') || 'パスワードが一致しません',
                  })}
                  placeholder="新しいパスワードを再入力"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-sm text-red-600 mt-1">{errors.confirm_password.message}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">セキュリティのヒント</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 他のサービスと同じパスワードを使用しない</li>
                <li>• 個人情報（名前、誕生日など）を含めない</li>
                <li>• 定期的にパスワードを変更する</li>
                <li>• パスワードマネージャーの使用を検討する</li>
              </ul>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/profile')}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    変更中...
                  </>
                ) : (
                  'パスワードを変更'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}