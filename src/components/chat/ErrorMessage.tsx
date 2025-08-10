/**
 * エラーメッセージコンポーネント
 */

import { FC } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ChatError } from '@/types/rag';

interface ErrorMessageProps {
  error: ChatError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorMessage: FC<ErrorMessageProps> = ({ error, onRetry, onDismiss }) => {
  return (
    <div className="mx-4 mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
      <div className="flex gap-3">
        {/* エラーアイコン */}
        <div className="flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>

        {/* エラー内容 */}
        <div className="flex-1 space-y-2">
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
            エラーが発生しました
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300">
            {error.message}
          </p>
          
          {error.code && (
            <p className="text-xs text-red-600 dark:text-red-400">
              エラーコード: {error.code}
            </p>
          )}

          {/* アクションボタン */}
          <div className="flex gap-2 mt-3">
            {error.retryable && onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="text-red-700 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                再試行
              </Button>
            )}
            
            {onDismiss && (
              <Button
                onClick={onDismiss}
                variant="ghost"
                size="sm"
                className="text-red-700 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200"
              >
                閉じる
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};