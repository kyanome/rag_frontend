/**
 * 引用インラインマーカーコンポーネント
 * 回答テキスト内の引用参照を[1], [2]形式でマーカー表示
 */

import { FC, ReactElement } from 'react';
import { cn } from '@/lib/utils';
import type { Citation } from '@/types/rag';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FileText } from 'lucide-react';

interface CitationInlineMarkerProps {
  index: number;
  citation: Citation;
  onClick?: () => void;
}

export const CitationInlineMarker: FC<CitationInlineMarkerProps> = ({
  index,
  citation,
  onClick,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              'inline-flex items-center justify-center',
              'w-6 h-6 mx-0.5',
              'text-xs font-medium',
              'rounded-md transition-all',
              'bg-blue-100 text-blue-700',
              'hover:bg-blue-200 hover:scale-110',
              'dark:bg-blue-900 dark:text-blue-300',
              'dark:hover:bg-blue-800',
              'cursor-pointer'
            )}
            onClick={onClick}
            aria-label={`引用 ${index}: ${citation.documentTitle}`}
          >
            [{index}]
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-sm p-3 space-y-2"
          sideOffset={5}
        >
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-sm">{citation.documentTitle}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                {citation.contentSnippet}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>関連度: {Math.round(citation.relevanceScore * 100)}%</span>
                {citation.chunkIndex !== undefined && (
                  <span>• セクション {citation.chunkIndex + 1}</span>
                )}
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface ParsedTextWithCitationsProps {
  text: string;
  citations: Citation[];
  onCitationClick?: (citation: Citation, index: number) => void;
}

/**
 * テキストを解析して引用マーカーを挿入
 */
export const ParsedTextWithCitations: FC<ParsedTextWithCitationsProps> = ({
  text,
  citations,
  onCitationClick,
}) => {
  // [Document N] または [N] 形式の引用を検出
  const citationPattern = /\[(?:Document\s+)?(\d+)\]/g;
  
  const parts: (string | ReactElement)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = citationPattern.exec(text)) !== null) {
    // マッチ前のテキストを追加
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // 引用番号を取得（1-indexed）
    const citationIndex = parseInt(match[1], 10);
    const citation = citations[citationIndex - 1];

    if (citation) {
      // 引用マーカーを追加
      parts.push(
        <CitationInlineMarker
          key={`citation-${match.index}`}
          index={citationIndex}
          citation={citation}
          onClick={() => onCitationClick?.(citation, citationIndex)}
        />
      );
    } else {
      // 引用が見つからない場合は元のテキストをそのまま表示
      parts.push(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  // 残りのテキストを追加
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
};