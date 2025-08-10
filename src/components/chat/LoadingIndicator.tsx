/**
 * ローディングインジケーターコンポーネント
 */

import { FC } from 'react';
import { Loader2, Bot } from 'lucide-react';

interface LoadingIndicatorProps {
  message?: string;
}

export const LoadingIndicator: FC<LoadingIndicatorProps> = ({ 
  message = 'AI が考えています...' 
}) => {
  return (
    <div className="flex gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30">
      {/* AIアバター */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center">
        <Bot className="w-4 h-4" />
      </div>

      {/* ローディング表示 */}
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span className="font-medium">AI アシスタント</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {message}
          </span>
          
          {/* タイピングアニメーション */}
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
};