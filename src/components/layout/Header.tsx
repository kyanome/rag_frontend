import React from 'react';
import { FileText } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">RAG システム</h1>
            <p className="text-sm text-gray-600">文書管理とAI検索</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;