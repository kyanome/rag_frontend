/**
 * 引用カードコンポーネント
 */

import { FC, useState } from 'react';
import { FileText, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Citation } from '@/types/rag';
import { Progress } from '@/components/ui/progress';

interface CitationCardProps {
  citation: Citation;
  index: number;
  isHighlighted?: boolean;
}

export const CitationCard: FC<CitationCardProps> = ({ citation, index, isHighlighted = false }) => {
  const relevancePercentage = Math.round(citation.relevanceScore * 100);
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className={cn(
      "border rounded-lg p-3 hover:shadow-md transition-all",
      isHighlighted 
        ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 ring-2 ring-blue-400 dark:ring-blue-600" 
        : "bg-white dark:bg-gray-800"
    )}>
      <div className="flex items-start gap-3">
        {/* インデックス番号 */}
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">{index}</span>
        </div>

        {/* 引用内容 */}
        <div className="flex-1 space-y-2">
          {/* タイトルとスコア */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {citation.documentTitle}
              </h5>
            </div>
            <div className="flex items-center gap-2">
              {/* 関連度プログレスバー */}
              <div className="w-20">
                <Progress 
                  value={relevancePercentage} 
                  className="h-2"
                />
              </div>
              <span
                className={cn(
                  'text-xs font-medium px-2 py-1 rounded',
                  relevancePercentage >= 80
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : relevancePercentage >= 60
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                )}
              >
                {relevancePercentage}%
              </span>
            </div>
          </div>

          {/* 抜粋 */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className={cn(
              "transition-all",
              isExpanded ? "" : "line-clamp-2"
            )}>
              {citation.contentSnippet}
            </p>
            
            {/* 展開した時の追加コンテキスト */}
            {isExpanded && citation.contentSnippet.length > 150 && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">全文:</p>
                <p className="text-sm">{citation.contentSnippet}</p>
              </div>
            )}
          </div>

          {/* メタ情報と展開ボタン */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              {citation.chunkIndex !== undefined && (
                <span>セクション {citation.chunkIndex + 1}</span>
              )}
              <a
                href={`/documents/${citation.documentId}`}
                className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                文書を開く
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            
            {/* 展開/折りたたみボタン */}
            {citation.contentSnippet.length > 150 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    折りたたむ
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    展開
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};