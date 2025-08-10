/**
 * 引用フィルタリングコンポーネント
 * 引用を信頼度や関連性でフィルタリング・ソート
 */

import { FC, useState } from 'react';
import { Filter, SortAsc, SortDesc } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Citation } from '@/types/rag';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface CitationFilterProps {
  citations: Citation[];
  onFilterChange: (filtered: Citation[]) => void;
  className?: string;
}

type SortOption = 'relevance-desc' | 'relevance-asc' | 'title-asc' | 'title-desc';
type FilterLevel = 'all' | 'high' | 'medium' | 'low';

export const CitationFilter: FC<CitationFilterProps> = ({
  citations,
  onFilterChange,
  className,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('relevance-desc');
  const [filterLevel, setFilterLevel] = useState<FilterLevel>('all');
  const [minRelevance, setMinRelevance] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // フィルタリングとソート処理
  const applyFilters = () => {
    let filtered = [...citations];

    // 関連度フィルタリング
    if (minRelevance > 0) {
      filtered = filtered.filter(c => c.relevanceScore >= minRelevance / 100);
    }

    // レベルフィルタリング
    if (filterLevel !== 'all') {
      filtered = filtered.filter(c => {
        const score = c.relevanceScore * 100;
        switch (filterLevel) {
          case 'high':
            return score >= 80;
          case 'medium':
            return score >= 60 && score < 80;
          case 'low':
            return score < 60;
          default:
            return true;
        }
      });
    }

    // ソート処理
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'relevance-desc':
          return b.relevanceScore - a.relevanceScore;
        case 'relevance-asc':
          return a.relevanceScore - b.relevanceScore;
        case 'title-asc':
          return a.documentTitle.localeCompare(b.documentTitle);
        case 'title-desc':
          return b.documentTitle.localeCompare(a.documentTitle);
        default:
          return 0;
      }
    });

    onFilterChange(filtered);
  };

  // フィルター設定が変更されたら自動適用
  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    setTimeout(applyFilters, 0);
  };

  const handleFilterLevelChange = (value: FilterLevel) => {
    setFilterLevel(value);
    setTimeout(applyFilters, 0);
  };

  const handleMinRelevanceChange = (value: number[]) => {
    setMinRelevance(value[0]);
    setTimeout(applyFilters, 0);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* フィルターヘッダー */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <Filter className="w-4 h-4" />
          フィルター・並べ替え
          <span className="text-xs text-gray-500">
            ({citations.length}件)
          </span>
        </button>
        
        {isExpanded && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSortBy('relevance-desc');
              setFilterLevel('all');
              setMinRelevance(0);
              onFilterChange(citations);
            }}
          >
            リセット
          </Button>
        )}
      </div>

      {/* フィルターコントロール */}
      {isExpanded && (
        <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          {/* ソート設定 */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              並べ替え
            </label>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance-desc">
                  <div className="flex items-center gap-1">
                    <SortDesc className="w-3 h-3" />
                    関連度（高い順）
                  </div>
                </SelectItem>
                <SelectItem value="relevance-asc">
                  <div className="flex items-center gap-1">
                    <SortAsc className="w-3 h-3" />
                    関連度（低い順）
                  </div>
                </SelectItem>
                <SelectItem value="title-asc">
                  <div className="flex items-center gap-1">
                    <SortAsc className="w-3 h-3" />
                    文書名（A-Z）
                  </div>
                </SelectItem>
                <SelectItem value="title-desc">
                  <div className="flex items-center gap-1">
                    <SortDesc className="w-3 h-3" />
                    文書名（Z-A）
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 信頼度レベルフィルター */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              信頼度レベル
            </label>
            <Select value={filterLevel} onValueChange={handleFilterLevelChange}>
              <SelectTrigger className="w-full h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="high">
                  <span className="text-green-600">高（80%以上）</span>
                </SelectItem>
                <SelectItem value="medium">
                  <span className="text-yellow-600">中（60-79%）</span>
                </SelectItem>
                <SelectItem value="low">
                  <span className="text-gray-600">低（60%未満）</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 最小関連度スライダー */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              最小関連度: {minRelevance}%
            </label>
            <Slider
              value={[minRelevance]}
              onValueChange={handleMinRelevanceChange}
              min={0}
              max={100}
              step={10}
              className="w-full"
            />
          </div>

          {/* フィルター結果サマリー */}
          <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t">
            {citations.length}件中 {citations.length}件を表示
          </div>
        </div>
      )}
    </div>
  );
};