'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PageInfo } from '@/types/document';

interface PaginationProps {
  pageInfo: PageInfo;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const pageSizeOptions = [10, 20, 50, 100];

export default function Pagination({ 
  pageInfo, 
  onPageChange,
  onPageSizeChange 
}: PaginationProps) {
  const { page, page_size, total_count, total_pages } = pageInfo;
  
  const startItem = (page - 1) * page_size + 1;
  const endItem = Math.min(page * page_size, total_count);

  const renderPageButtons = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    const end = Math.min(total_pages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === page ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPageChange(i)}
        >
          {i}
        </Button>
      );
    }

    return pages;
  };

  if (total_count === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
      <div className="text-sm text-muted-foreground">
        {total_count} 件中 {startItem} - {endItem} 件を表示
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="text-sm">表示件数:</span>
          <Select
            value={page_size.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex gap-1">
            {renderPageButtons()}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page === total_pages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(total_pages)}
            disabled={page === total_pages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}