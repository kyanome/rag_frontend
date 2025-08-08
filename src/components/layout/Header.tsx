'use client';

import React from 'react';
import { FileText, Upload, FolderOpen, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  <span className="text-xs text-gray-500">({user.role})</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  ログアウト
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;