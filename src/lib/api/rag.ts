/**
 * RAG API クライアント
 */

import axios from '@/lib/axios';
import type {
  RAGQueryRequest,
  RAGQueryResponse,
  StreamChunk,
} from '@/types/rag';

/**
 * RAG APIのエンドポイント
 */
const RAG_API_BASE = '/api/v1/rag';

/**
 * RAGクエリを送信して回答を取得
 * @param request クエリリクエスト
 * @returns クエリレスポンス
 */
export async function sendRAGQuery(
  request: RAGQueryRequest
): Promise<RAGQueryResponse> {
  const response = await axios.post<RAGQueryResponse>(
    `${RAG_API_BASE}/query`,
    {
      query: request.query,
      search_type: request.searchType || 'hybrid',
      max_results: request.maxResults || 5,
      temperature: request.temperature || 0.7,
      include_citations: request.includeCitations !== false,
      stream: false,
      metadata: request.metadata || {},
    }
  );
  return response.data;
}

/**
 * ストリーミングRAGクエリを送信
 * @param request クエリリクエスト
 * @param onChunk チャンク受信時のコールバック
 * @param signal AbortSignal for cancellation
 */
export async function streamRAGQuery(
  request: RAGQueryRequest,
  onChunk: (chunk: StreamChunk) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${RAG_API_BASE}/query/stream`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthHeaders()),
      },
      body: JSON.stringify({
        query: request.query,
        search_type: request.searchType || 'hybrid',
        max_results: request.maxResults || 5,
        temperature: request.temperature || 0.7,
        include_citations: request.includeCitations !== false,
        stream: true,
        metadata: request.metadata || {},
      }),
      signal,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // 最後のチャンクを処理
        if (buffer.trim()) {
          onChunk({
            type: 'done',
            content: buffer,
          });
        }
        break;
      }

      // デコードしてバッファに追加
      buffer += decoder.decode(value, { stream: true });

      // 改行で分割して各行を処理
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 最後の不完全な行をバッファに残す

      for (const line of lines) {
        if (line.trim()) {
          try {
            // JSON形式のチャンクの場合
            if (line.startsWith('{')) {
              const chunk = JSON.parse(line) as StreamChunk;
              onChunk(chunk);
            } else {
              // プレーンテキストの場合
              onChunk({
                type: 'text',
                content: line,
              });
            }
          } catch {
            // JSONパースエラーの場合はテキストとして扱う
            onChunk({
              type: 'text',
              content: line,
            });
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * 認証ヘッダーを取得
 */
function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }

  const token = localStorage.getItem('access_token');
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }
  return {};
}

/**
 * RAGクエリのバリデーション
 */
export function validateRAGQuery(query: string): string | null {
  if (!query || query.trim().length === 0) {
    return '質問を入力してください';
  }
  if (query.length > 1000) {
    return '質問は1000文字以内で入力してください';
  }
  return null;
}

/**
 * 信頼度レベルの日本語表示を取得
 */
export function getConfidenceLevelLabel(level: 'high' | 'medium' | 'low'): string {
  switch (level) {
    case 'high':
      return '高';
    case 'medium':
      return '中';
    case 'low':
      return '低';
    default:
      return '不明';
  }
}

/**
 * 信頼度レベルの色を取得
 */
export function getConfidenceLevelColor(level: 'high' | 'medium' | 'low'): string {
  switch (level) {
    case 'high':
      return 'text-green-600 dark:text-green-400';
    case 'medium':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'low':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

/**
 * 処理時間のフォーマット
 */
export function formatProcessingTime(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  return `${(ms / 1000).toFixed(1)}秒`;
}