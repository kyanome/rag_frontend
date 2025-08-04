'use client';

import React from 'react';
import { FileText, Upload, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const pathname = usePathname();

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
        </div>
      </div>
    </header>
  );
};

export default Header;