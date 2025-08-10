/**
 * チャットメッセージアイテムコンポーネント
 */

import { FC } from 'react';
import { User, Bot, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/rag';
import { formatProcessingTime, getConfidenceLevelColor, getConfidenceLevelLabel } from '@/lib/api/rag';
import { CitationCard } from './CitationCard';

interface MessageItemProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export const MessageItem: FC<MessageItemProps> = ({ message, isStreaming = false }) => {
  const isUser = message.role === 'user';
  const isError = !!message.error;

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg transition-colors',
        isUser ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-gray-50 dark:bg-gray-900/30',
        isError && 'bg-red-50 dark:bg-red-950/30'
      )}
    >
      {/* アバター */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-blue-500 text-white' : isError ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : isError ? (
          <AlertCircle className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* メッセージ本体 */}
      <div className="flex-1 space-y-2">
        {/* ヘッダー */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium">
            {isUser ? 'あなた' : isError ? 'エラー' : 'AI アシスタント'}
          </span>
          <span>•</span>
          <time dateTime={message.timestamp.toISOString()}>
            {message.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
          </time>
          {message.processingTimeMs && (
            <>
              <span>•</span>
              <span>{formatProcessingTime(message.processingTimeMs)}</span>
            </>
          )}
        </div>

        {/* メッセージ内容 */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {message.content.split('\n').map((line, index) => (
            <p key={index} className="mb-2">
              {line}
              {isStreaming && index === message.content.split('\n').length - 1 && (
                <span className="inline-block w-2 h-4 ml-1 bg-gray-400 dark:bg-gray-600 animate-pulse" />
              )}
            </p>
          ))}
        </div>

        {/* 信頼度情報 */}
        {message.confidenceLevel && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500 dark:text-gray-400">信頼度:</span>
            <span className={cn('font-medium', getConfidenceLevelColor(message.confidenceLevel))}>
              {getConfidenceLevelLabel(message.confidenceLevel)}
            </span>
            {message.confidenceScore !== undefined && (
              <span className="text-gray-500 dark:text-gray-400">
                ({Math.round(message.confidenceScore * 100)}%)
              </span>
            )}
          </div>
        )}

        {/* 引用情報 */}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">参照文書:</h4>
            <div className="grid gap-2">
              {message.citations.map((citation, index) => (
                <CitationCard key={index} citation={citation} index={index + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};