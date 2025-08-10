/**
 * チャットコンテナコンポーネント
 */

'use client';

import { FC, useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { MessageItem } from './MessageItem';
import { ChatInput } from './ChatInput';
import { LoadingIndicator } from './LoadingIndicator';
import { ErrorMessage } from './ErrorMessage';
import { ChatSettings } from './ChatSettings';
import { Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatContainerProps {
  className?: string;
}

export const ChatContainer: FC<ChatContainerProps> = ({ className }) => {
  const {
    messages,
    streamingMessage,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    retryLastMessage,
    clearError,
    cancelRequest,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);

  // メッセージが追加されたら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  // 全メッセージ（ストリーミング中のメッセージを含む）
  const allMessages = streamingMessage
    ? [...messages, streamingMessage]
    : messages;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* ヘッダー */}
      <div className="border-b bg-white dark:bg-gray-900 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI アシスタント
          </h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <Settings className="w-4 h-4 mr-1" />
              設定
            </Button>
            <Button
              onClick={clearMessages}
              variant="ghost"
              size="sm"
              disabled={messages.length === 0}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              クリア
            </Button>
          </div>
        </div>
      </div>

      {/* 設定パネル */}
      {showSettings && (
        <div className="border-b bg-gray-50 dark:bg-gray-800/50 px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <ChatSettings onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto py-4 space-y-4">
          {/* エラー表示 */}
          {error && (
            <ErrorMessage
              error={error}
              onRetry={retryLastMessage}
              onDismiss={clearError}
            />
          )}

          {/* ウェルカムメッセージ */}
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                RAG システムへようこそ
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                文書に関する質問を入力してください
              </p>
              <div className="mt-6 space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">例:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    'RAGシステムの仕組みについて教えてください',
                    'この文書の要約を作成してください',
                    '特定のトピックに関する情報を検索してください',
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(example)}
                      className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* メッセージリスト */}
          {allMessages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isStreaming={message === streamingMessage}
            />
          ))}

          {/* ローディング表示（非ストリーミング時） */}
          {isLoading && !streamingMessage && <LoadingIndicator />}

          {/* スクロール位置の参照 */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 入力エリア */}
      <ChatInput
        onSend={sendMessage}
        onCancel={cancelRequest}
        isLoading={isLoading}
      />
    </div>
  );
};