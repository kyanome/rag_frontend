/**
 * 引用カードコンポーネント
 */

import { FC } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Citation } from '@/types/rag';

interface CitationCardProps {
  citation: Citation;
  index: number;
}

export const CitationCard: FC<CitationCardProps> = ({ citation, index }) => {
  const relevancePercentage = Math.round(citation.relevanceScore * 100);
  
  return (
    <div className="border rounded-lg p-3 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
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

          {/* 抜粋 */}
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {citation.contentSnippet}
          </p>

          {/* メタ情報 */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
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
        </div>
      </div>
    </div>
  );
};