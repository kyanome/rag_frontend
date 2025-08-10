/**
 * RAG (Retrieval-Augmented Generation) 関連の型定義
 */

/**
 * RAGクエリリクエスト
 */
export interface RAGQueryRequest {
  /** 質問テキスト */
  query: string;
  /** 検索タイプ (keyword/vector/hybrid) */
  searchType?: 'keyword' | 'vector' | 'hybrid';
  /** 検索結果の最大数 */
  maxResults?: number;
  /** LLMの生成温度 */
  temperature?: number;
  /** 引用を含めるかどうか */
  includeCitations?: boolean;
  /** ストリーミング応答を使用するか */
  stream?: boolean;
  /** その他のメタデータ */
  metadata?: Record<string, unknown>;
}

/**
 * 引用情報
 */
export interface Citation {
  /** 文書ID */
  documentId: string;
  /** 文書タイトル */
  documentTitle: string;
  /** チャンクID */
  chunkId?: string;
  /** チャンクインデックス */
  chunkIndex?: number;
  /** 内容の抜粋 */
  contentSnippet: string;
  /** 関連性スコア */
  relevanceScore: number;
}

/**
 * RAGクエリレスポンス
 */
export interface RAGQueryResponse {
  /** 応答ID */
  answerId: string;
  /** クエリID */
  queryId: string;
  /** 回答テキスト */
  answer: string;
  /** 引用情報 */
  citations: Citation[];
  /** 信頼度スコア */
  confidenceScore: number;
  /** 信頼度レベル (high/medium/low) */
  confidenceLevel: 'high' | 'medium' | 'low';
  /** 検索結果数 */
  searchResultsCount: number;
  /** 処理時間（ミリ秒） */
  processingTimeMs: number;
  /** 使用したモデル名 */
  modelName: string;
  /** トークン使用量 */
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
}

/**
 * チャットメッセージの役割
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * チャットメッセージ
 */
export interface ChatMessage {
  /** メッセージID */
  id: string;
  /** 役割 */
  role: MessageRole;
  /** メッセージ内容 */
  content: string;
  /** タイムスタンプ */
  timestamp: Date;
  /** 引用情報（AIの回答の場合） */
  citations?: Citation[];
  /** 信頼度スコア（AIの回答の場合） */
  confidenceScore?: number;
  /** 信頼度レベル（AIの回答の場合） */
  confidenceLevel?: 'high' | 'medium' | 'low';
  /** 処理時間（AIの回答の場合） */
  processingTimeMs?: number;
  /** エラー情報 */
  error?: string;
  /** ローディング状態 */
  isLoading?: boolean;
}

/**
 * ストリーミングチャンク
 */
export interface StreamChunk {
  /** チャンクタイプ */
  type: 'text' | 'citation' | 'metadata' | 'error' | 'done';
  /** テキストコンテンツ */
  content?: string;
  /** 引用情報 */
  citation?: Citation;
  /** メタデータ */
  metadata?: {
    confidenceScore?: number;
    confidenceLevel?: 'high' | 'medium' | 'low';
    processingTimeMs?: number;
    modelName?: string;
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
  };
  /** エラー情報 */
  error?: string;
}

/**
 * チャット設定
 */
export interface ChatSettings {
  /** 検索タイプ */
  searchType: 'keyword' | 'vector' | 'hybrid';
  /** 最大検索結果数 */
  maxResults: number;
  /** 生成温度 */
  temperature: number;
  /** 引用を含めるか */
  includeCitations: boolean;
  /** ストリーミングを使用するか */
  useStreaming: boolean;
}

/**
 * チャットエラー
 */
export interface ChatError {
  /** エラーメッセージ */
  message: string;
  /** エラーコード */
  code?: string;
  /** 詳細情報 */
  details?: unknown;
  /** リトライ可能か */
  retryable?: boolean;
}