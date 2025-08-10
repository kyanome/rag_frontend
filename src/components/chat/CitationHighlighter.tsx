/**
 * 引用ハイライトコンポーネント
 * 回答テキスト内の引用箇所をハイライト表示
 */

import { FC, useMemo, ReactElement } from 'react';
import { cn } from '@/lib/utils';
import type { Citation } from '@/types/rag';

interface CitationHighlighterProps {
  text: string;
  citations: Citation[];
  highlightColor?: 'yellow' | 'blue' | 'green' | 'purple';
  className?: string;
}

interface HighlightRange {
  start: number;
  end: number;
  citation: Citation;
  index: number;
}

/**
 * テキスト内の引用箇所を検出してハイライト範囲を生成
 */
function findHighlightRanges(
  text: string,
  citations: Citation[]
): HighlightRange[] {
  const ranges: HighlightRange[] = [];
  const textLower = text.toLowerCase();

  citations.forEach((citation, index) => {
    // 引用のキーフレーズを抽出（最初の30文字程度）
    const keyPhrase = citation.contentSnippet
      .substring(0, 50)
      .toLowerCase()
      .replace(/[^\w\s]/gi, '') // 特殊文字を除去
      .split(/\s+/)
      .filter(word => word.length > 3); // 短い単語を除外

    // キーフレーズの組み合わせを検索
    for (let i = 0; i < keyPhrase.length - 1; i++) {
      const searchPhrase = keyPhrase.slice(i, i + 3).join(' ');
      const index = textLower.indexOf(searchPhrase);
      
      if (index !== -1) {
        ranges.push({
          start: index,
          end: index + searchPhrase.length,
          citation,
          index: index + 1,
        });
        break;
      }
    }

    // 文書タイトルも検索対象に含める
    const titleIndex = textLower.indexOf(citation.documentTitle.toLowerCase());
    if (titleIndex !== -1) {
      ranges.push({
        start: titleIndex,
        end: titleIndex + citation.documentTitle.length,
        citation,
        index: index + 1,
      });
    }
  });

  // 重複する範囲をマージ
  return mergeOverlappingRanges(ranges);
}

/**
 * 重複するハイライト範囲をマージ
 */
function mergeOverlappingRanges(ranges: HighlightRange[]): HighlightRange[] {
  if (ranges.length === 0) return ranges;

  const sorted = ranges.sort((a, b) => a.start - b.start);
  const merged: HighlightRange[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const current = sorted[i];

    if (current.start <= last.end) {
      // 範囲が重複している場合はマージ
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push(current);
    }
  }

  return merged;
}

export const CitationHighlighter: FC<CitationHighlighterProps> = ({
  text,
  citations,
  highlightColor = 'yellow',
  className,
}) => {
  const highlightRanges = useMemo(
    () => findHighlightRanges(text, citations),
    [text, citations]
  );

  const highlightClasses = {
    yellow: 'bg-yellow-200 dark:bg-yellow-900/50',
    blue: 'bg-blue-200 dark:bg-blue-900/50',
    green: 'bg-green-200 dark:bg-green-900/50',
    purple: 'bg-purple-200 dark:bg-purple-900/50',
  };

  // ハイライト範囲がない場合はそのままテキストを返す
  if (highlightRanges.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // テキストをハイライト範囲で分割
  const parts: ReactElement[] = [];
  let lastIndex = 0;

  highlightRanges.forEach((range, idx) => {
    // ハイライト前のテキスト
    if (range.start > lastIndex) {
      parts.push(
        <span key={`text-${idx}`}>
          {text.substring(lastIndex, range.start)}
        </span>
      );
    }

    // ハイライト部分
    parts.push(
      <mark
        key={`highlight-${idx}`}
        className={cn(
          'px-0.5 rounded',
          highlightClasses[highlightColor],
          'transition-colors duration-200'
        )}
        data-citation-index={range.index}
        title={`引用: ${range.citation.documentTitle}`}
      >
        {text.substring(range.start, range.end)}
      </mark>
    );

    lastIndex = range.end;
  });

  // 残りのテキスト
  if (lastIndex < text.length) {
    parts.push(
      <span key="text-final">{text.substring(lastIndex)}</span>
    );
  }

  return <span className={className}>{parts}</span>;
};

interface HighlightedMessageProps {
  text: string;
  citations: Citation[];
  enableHighlight?: boolean;
  highlightColor?: 'yellow' | 'blue' | 'green' | 'purple';
  className?: string;
}

/**
 * メッセージテキスト全体のハイライト表示
 */
export const HighlightedMessage: FC<HighlightedMessageProps> = ({
  text,
  citations,
  enableHighlight = true,
  highlightColor = 'yellow',
  className,
}) => {
  if (!enableHighlight || citations.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // 段落ごとに処理
  const paragraphs = text.split('\n');
  
  return (
    <div className={className}>
      {paragraphs.map((paragraph, index) => (
        <div key={index} className={index > 0 ? 'mt-2' : ''}>
          <CitationHighlighter
            text={paragraph}
            citations={citations}
            highlightColor={highlightColor}
          />
        </div>
      ))}
    </div>
  );
};