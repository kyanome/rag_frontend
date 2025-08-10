/**
 * 引用管理コンポーネント
 * 引用マーカーとカードの相互作用を管理
 */

import { FC, useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Citation } from '@/types/rag';
import { ParsedTextWithCitations } from './CitationInlineMarker';
import { HighlightedMessage } from './CitationHighlighter';
import { CitationCard } from './CitationCard';

interface CitationManagerProps {
  text: string;
  citations: Citation[];
  enableHighlight?: boolean;
  highlightColor?: 'yellow' | 'blue' | 'green' | 'purple';
  enableSync?: boolean;
  className?: string;
}

export const CitationManager: FC<CitationManagerProps> = ({
  text,
  citations,
  enableHighlight = true,
  highlightColor = 'yellow',
  enableSync = true,
  className,
}) => {
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const citationRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  // 引用マーカークリック時の処理
  const handleCitationClick = useCallback((citation: Citation, index: number) => {
    setHighlightedIndex(index);
    
    // 対応する引用カードまでスクロール
    if (enableSync) {
      const cardElement = citationRefs.current.get(index);
      if (cardElement) {
        cardElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
        
        // ハイライトアニメーション
        cardElement.classList.add('citation-pulse');
        setTimeout(() => {
          cardElement.classList.remove('citation-pulse');
        }, 1000);
      }
    }
  }, [enableSync]);

  // 引用カードホバー時の処理
  const handleCardHover = useCallback((index: number | null) => {
    setHoveredIndex(index);
  }, []);

  // 引用カードクリック時の処理
  const handleCardClick = useCallback((index: number) => {
    setHighlightedIndex(index);
    
    // テキスト内の対応するマーカーを探してハイライト
    if (enableSync) {
      const markerElement = document.querySelector(
        `[data-citation-marker="${index}"]`
      ) as HTMLElement;
      
      if (markerElement) {
        markerElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        
        // マーカーをフラッシュ
        markerElement.classList.add('marker-flash');
        setTimeout(() => {
          markerElement.classList.remove('marker-flash');
        }, 1000);
      }
    }
  }, [enableSync]);

  // カード参照を設定
  const setCardRef = useCallback((index: number, element: HTMLDivElement | null) => {
    if (element) {
      citationRefs.current.set(index, element);
    } else {
      citationRefs.current.delete(index);
    }
  }, []);

  // キーボードナビゲーション
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!enableSync || citations.length === 0) return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        setHighlightedIndex(prev => {
          const next = prev === null ? 1 : Math.min(prev + 1, citations.length);
          return next;
        });
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        setHighlightedIndex(prev => {
          const next = prev === null ? citations.length : Math.max(prev - 1, 1);
          return next;
        });
      } else if (e.key === 'Escape') {
        setHighlightedIndex(null);
        setHoveredIndex(null);
      }
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [citations.length, enableSync]);

  return (
    <div ref={containerRef} className={cn('space-y-4', className)} tabIndex={0}>
      {/* テキスト表示部分 */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {enableHighlight ? (
          <HighlightedMessage
            text={text}
            citations={citations}
            enableHighlight={true}
            highlightColor={highlightColor}
          />
        ) : (
          text.split('\n').map((line, index) => (
            <p key={index} className="mb-2">
              <ParsedTextWithCitations
                text={line}
                citations={citations}
                onCitationClick={handleCitationClick}
              />
            </p>
          ))
        )}
      </div>

      {/* 引用カード表示部分 */}
      {citations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              参照文書 ({citations.length}件)
            </h4>
            {enableSync && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                ↑↓キーで移動、Escでクリア
              </div>
            )}
          </div>
          
          <div
            className="grid gap-2 max-h-96 overflow-y-auto pr-2"
            data-testid="citations-container"
          >
            {citations.map((citation, index) => {
              const citationIndex = index + 1;
              const isHighlighted = highlightedIndex === citationIndex;
              const isHovered = hoveredIndex === citationIndex;
              
              return (
                <div
                  key={index}
                  ref={(el) => setCardRef(citationIndex, el)}
                  onClick={() => handleCardClick(citationIndex)}
                  onMouseEnter={() => handleCardHover(citationIndex)}
                  onMouseLeave={() => handleCardHover(null)}
                  className={cn(
                    'transition-all cursor-pointer',
                    isHovered && 'scale-[1.02]'
                  )}
                  data-testid="citation-card"
                >
                  <CitationCard
                    citation={citation}
                    index={citationIndex}
                    isHighlighted={isHighlighted}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        .citation-pulse {
          animation: pulse-shadow 1s ease-out;
        }
        
        .marker-flash {
          animation: flash-bg 1s ease-out;
        }
        
        @keyframes pulse-shadow {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
        
        @keyframes flash-bg {
          0% {
            background-color: rgba(59, 130, 246, 0.3);
          }
          100% {
            background-color: transparent;
          }
        }
      `}</style>
    </div>
  );
};