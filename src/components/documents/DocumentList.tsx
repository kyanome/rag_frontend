'use client';

import React from 'react';
import { DocumentListItem } from '@/types/document';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  FileArchive, 
  FileSpreadsheet, 
  FileIcon,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface DocumentListProps {
  documents: DocumentListItem[];
  onView: (documentId: string) => void;
  onEdit: (documentId: string) => void;
  onDelete: (documentId: string) => void;
}

const getFileIcon = (contentType: string) => {
  if (contentType.includes('pdf')) return <FileText className="h-4 w-4" />;
  if (contentType.includes('zip') || contentType.includes('archive')) return <FileArchive className="h-4 w-4" />;
  if (contentType.includes('sheet') || contentType.includes('csv')) return <FileSpreadsheet className="h-4 w-4" />;
  return <FileIcon className="h-4 w-4" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function DocumentList({ 
  documents, 
  onView, 
  onEdit, 
  onDelete 
}: DocumentListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead>タイトル</TableHead>
            <TableHead>カテゴリ</TableHead>
            <TableHead>タグ</TableHead>
            <TableHead>作成者</TableHead>
            <TableHead>サイズ</TableHead>
            <TableHead>作成日時</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                文書がありません
              </TableCell>
            </TableRow>
          ) : (
            documents.map((document) => (
              <TableRow key={document.document_id}>
                <TableCell>
                  {getFileIcon(document.content_type)}
                </TableCell>
                <TableCell className="font-medium">
                  {document.title}
                </TableCell>
                <TableCell>
                  {document.category || '-'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {document.tags.length > 0 ? (
                      document.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      '-'
                    )}
                  </div>
                </TableCell>
                <TableCell>{document.author || '-'}</TableCell>
                <TableCell>{formatFileSize(document.file_size)}</TableCell>
                <TableCell>{formatDate(document.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(document.document_id)}
                      title="詳細を表示"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(document.document_id)}
                      title="編集"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(document.document_id)}
                      title="削除"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}