/**
 * チャット状態管理ストア
 */

import { create } from 'zustand';
import type {
  ChatMessage,
  ChatSettings,
  ChatError,
  StreamChunk,
  Citation,
} from '@/types/rag';
import { sendRAGQuery, streamRAGQuery } from '@/lib/api/rag';

interface ChatState {
  // メッセージ履歴
  messages: ChatMessage[];
  // 現在のストリーミングメッセージ
  streamingMessage: ChatMessage | null;
  // ローディング状態
  isLoading: boolean;
  // エラー状態
  error: ChatError | null;
  // チャット設定
  settings: ChatSettings;
  // AbortController for cancelling requests
  abortController: AbortController | null;

  // アクション
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  removeMessage: (id: string) => void;
  retryLastMessage: () => Promise<void>;
  updateSettings: (settings: Partial<ChatSettings>) => void;
  clearError: () => void;
  cancelRequest: () => void;
}

// デフォルト設定
const defaultSettings: ChatSettings = {
  searchType: 'hybrid',
  maxResults: 5,
  temperature: 0.7,
  includeCitations: true,
  useStreaming: true,
};

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  streamingMessage: null,
  isLoading: false,
  error: null,
  settings: defaultSettings,
  abortController: null,

  sendMessage: async (content: string) => {
    const { settings, abortController } = get();

    // 既存のリクエストをキャンセル
    if (abortController) {
      abortController.abort();
    }

    // 新しいAbortControllerを作成
    const newAbortController = new AbortController();
    set({ abortController: newAbortController });

    // ユーザーメッセージを追加
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
      error: null,
      streamingMessage: null,
    }));

    try {
      if (settings.useStreaming) {
        // ストリーミング処理
        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          isLoading: true,
        };

        set({ streamingMessage: assistantMessage });

        let fullContent = '';
        const citations: Citation[] = [];
        let metadata: {
          confidenceScore?: number;
          confidenceLevel?: 'high' | 'medium' | 'low';
          processingTimeMs?: number;
          modelName?: string;
          tokenUsage?: Record<string, number>;
        } = {};

        await streamRAGQuery(
          {
            query: content,
            searchType: settings.searchType,
            maxResults: settings.maxResults,
            temperature: settings.temperature,
            includeCitations: settings.includeCitations,
            stream: true,
          },
          (chunk: StreamChunk) => {
            if (newAbortController.signal.aborted) {
              return;
            }

            switch (chunk.type) {
              case 'text':
                fullContent += chunk.content || '';
                set((state) => ({
                  streamingMessage: state.streamingMessage
                    ? {
                        ...state.streamingMessage,
                        content: fullContent,
                      }
                    : null,
                }));
                break;

              case 'citation':
                if (chunk.citation) {
                  citations.push(chunk.citation);
                }
                break;

              case 'metadata':
                if (chunk.metadata) {
                  metadata = { ...metadata, ...chunk.metadata };
                }
                break;

              case 'error':
                throw new Error(chunk.error || 'Unknown streaming error');

              case 'done':
                // ストリーミング完了
                set((state) => {
                  const finalMessage: ChatMessage = {
                    ...assistantMessage,
                    content: fullContent,
                    citations: citations.length > 0 ? citations : undefined,
                    confidenceScore: metadata.confidenceScore,
                    confidenceLevel: metadata.confidenceLevel,
                    processingTimeMs: metadata.processingTimeMs,
                    isLoading: false,
                  };

                  return {
                    messages: [...state.messages, finalMessage],
                    streamingMessage: null,
                    isLoading: false,
                  };
                });
                break;
            }
          },
          newAbortController.signal
        );
      } else {
        // 通常のリクエスト
        const response = await sendRAGQuery({
          query: content,
          searchType: settings.searchType,
          maxResults: settings.maxResults,
          temperature: settings.temperature,
          includeCitations: settings.includeCitations,
          stream: false,
        });

        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: response.answer,
          timestamp: new Date(),
          citations: response.citations,
          confidenceScore: response.confidenceScore,
          confidenceLevel: response.confidenceLevel,
          processingTimeMs: response.processingTimeMs,
        };

        set((state) => ({
          messages: [...state.messages, assistantMessage],
          isLoading: false,
        }));
      }
    } catch (error) {
      // エラーハンドリング
      const err = error as Error & { response?: { data?: { detail?: string }; status?: number } };
      if (err.name === 'AbortError') {
        // リクエストがキャンセルされた場合
        set({ isLoading: false, streamingMessage: null });
        return;
      }

      const chatError: ChatError = {
        message: err.response?.data?.detail || err.message || '予期しないエラーが発生しました',
        code: err.response?.status?.toString(),
        details: err.response?.data,
        retryable: err.response?.status !== 400,
      };

      // エラーメッセージを追加
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: `エラーが発生しました: ${chatError.message}`,
        timestamp: new Date(),
        error: chatError.message,
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
        isLoading: false,
        error: chatError,
        streamingMessage: null,
      }));
    } finally {
      set({ abortController: null });
    }
  },

  clearMessages: () => {
    set({ messages: [], error: null, streamingMessage: null });
  },

  removeMessage: (id: string) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id),
    }));
  },

  retryLastMessage: async () => {
    const { messages, sendMessage } = get();
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((msg) => msg.role === 'user');

    if (lastUserMessage) {
      // 最後のアシスタントメッセージ（エラー）を削除
      const lastAssistantIndex = messages
        .map((msg, index) => (msg.role === 'assistant' ? index : -1))
        .filter((index) => index !== -1)
        .pop();

      if (lastAssistantIndex !== undefined) {
        set((state) => ({
          messages: state.messages.slice(0, lastAssistantIndex),
        }));
      }

      // メッセージを再送信
      await sendMessage(lastUserMessage.content);
    }
  },

  updateSettings: (newSettings: Partial<ChatSettings>) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  clearError: () => {
    set({ error: null });
  },

  cancelRequest: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
      set({
        isLoading: false,
        streamingMessage: null,
        abortController: null,
      });
    }
  },
}));

// UUID生成関数
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}