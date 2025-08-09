'use client';

import React from 'react';
import { FileText, Upload, FolderOpen, LogOut, User, Settings, Key, Users, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/auth.store';
import { AuthClient } from '@/lib/auth/client';
import { TokenManager } from '@/lib/auth/token';

const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout: logoutStore } = useAuthStore();
  
  const handleLogout = async () => {
    try {
      await AuthClient.logout();
      TokenManager.clearTokens();
      logoutStore();
      toast.success('ログアウトしました');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('ログアウトに失敗しました');
    }
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">RAG システム</h1>
              <p className="text-sm text-gray-600">文書管理とAI検索</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              <Link 
                href="/" 
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  pathname === '/' ? 'text-primary' : 'text-gray-600'
                }`}
              >
                <Upload className="h-4 w-4" />
                アップロード
              </Link>
              <Link 
                href="/documents" 
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  pathname === '/documents' ? 'text-primary' : 'text-gray-600'
                }`}
              >
                <FolderOpen className="h-4 w-4" />
                文書管理
              </Link>
            </nav>
            
            {user && (
              <div className="flex items-center space-x-4 border-l pl-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-gray-500">({user.role})</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>プロフィール設定</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/password" className="flex items-center cursor-pointer">
                        <Key className="mr-2 h-4 w-4" />
                        <span>パスワード変更</span>
                      </Link>
                    </DropdownMenuItem>
                    {user.role === 'admin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin/users" className="flex items-center cursor-pointer">
                            <Users className="mr-2 h-4 w-4" />
                            <span>ユーザー管理</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>ログアウト</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;