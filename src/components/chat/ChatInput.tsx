/**
 * チャット入力コンポーネント
 */

import { FC, useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { validateRAGQuery } from '@/lib/api/rag';

interface ChatInputProps {
  onSend: (message: string) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export const ChatInput: FC<ChatInputProps> = ({
  onSend,
  onCancel,
  isLoading = false,
  placeholder = '質問を入力してください...',
  maxLength = 1000,
}) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // テキストエリアの高さを自動調整
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  // フォーカスを設定
  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = () => {
    const validationError = validateRAGQuery(message);
    if (validationError) {
      setError(validationError);
      return;
    }

    onSend(message);
    setMessage('');
    setError(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter または Cmd+Enter で送信
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && message.trim()) {
        handleSubmit();
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="border-t bg-white dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* エラー表示 */}
        {error && (
          <div className="mb-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* 入力エリア */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              maxLength={maxLength}
              className={cn(
                'w-full px-4 py-3 pr-20 rounded-lg border resize-none',
                'bg-gray-50 dark:bg-gray-800',
                'border-gray-300 dark:border-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'placeholder:text-gray-500 dark:placeholder:text-gray-400',
                'text-gray-900 dark:text-gray-100'
              )}
              rows={1}
            />
            
            {/* 文字数カウンター */}
            <div className="absolute bottom-3 right-3 text-xs text-gray-500 dark:text-gray-400">
              {message.length} / {maxLength}
            </div>
          </div>

          {/* 送信/キャンセルボタン */}
          <div className="flex flex-col gap-2">
            {isLoading ? (
              <>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  title="キャンセル"
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="h-10 w-10 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                </div>
              </>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!message.trim()}
                size="icon"
                className="h-10 w-10"
                title="送信 (Ctrl+Enter)"
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* ヒント */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
              Ctrl
            </kbd>
            +
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
              Enter
            </kbd>
            で送信
          </span>
        </div>
      </div>
    </div>
  );
};