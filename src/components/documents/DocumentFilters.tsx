'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { DocumentFilter } from '@/types/document';

interface DocumentFiltersProps {
  filters: DocumentFilter;
  onFiltersChange: (filters: DocumentFilter) => void;
  onReset: () => void;
}

const categories = [
  '技術文書',
  '仕様書',
  '契約書',
  'マニュアル',
  'レポート',
  'その他'
];

export default function DocumentFilters({ 
  filters, 
  onFiltersChange,
  onReset 
}: DocumentFiltersProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, title: e.target.value });
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      category: value === 'all' ? undefined : value 
    });
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, author: e.target.value });
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    onFiltersChange({ ...filters, tags: tags.length > 0 ? tags : undefined });
  };

  const hasActiveFilters = filters.title || filters.category || filters.author || filters.tags?.length;

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Search className="h-5 w-5" />
          フィルター
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            リセット
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">タイトル</Label>
          <Input
            id="title"
            placeholder="タイトルで検索..."
            value={filters.title || ''}
            onChange={handleTitleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">カテゴリ</Label>
          <Select
            value={filters.category || 'all'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="author">作成者</Label>
          <Input
            id="author"
            placeholder="作成者名..."
            value={filters.author || ''}
            onChange={handleAuthorChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">タグ</Label>
          <Input
            id="tags"
            placeholder="タグ（カンマ区切り）"
            value={filters.tags?.join(', ') || ''}
            onChange={handleTagsChange}
          />
        </div>
      </div>
    </div>
  );
}