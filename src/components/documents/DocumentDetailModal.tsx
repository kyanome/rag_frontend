'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getDocument } from '@/lib/api/documents';
import { Document } from '@/types/document';
import { FileText, Calendar, User, Tag, FolderOpen, HardDrive, Hash } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentDetailModalProps {
  documentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (documentId: string) => void;
}

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
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function DocumentDetailModal({
  documentId,
  isOpen,
  onClose,
  onEdit
}: DocumentDetailModalProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentId) return;
      
      setLoading(true);
      try {
        const data = await getDocument(documentId);
        setDocument(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '文書の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (documentId && isOpen) {
      fetchDocument();
    }
  }, [documentId, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>文書詳細</DialogTitle>
          <DialogDescription>
            文書の詳細情報を表示しています
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">読み込み中...</div>
        ) : document ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">{document.title}</h3>
              {document.description && (
                <p className="text-muted-foreground">{document.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">ファイル名</p>
                    <p className="text-sm text-muted-foreground">{document.file_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <HardDrive className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">ファイルサイズ</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(document.file_size)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FolderOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">カテゴリ</p>
                    <p className="text-sm text-muted-foreground">{document.category || '未分類'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">作成者</p>
                    <p className="text-sm text-muted-foreground">{document.author || '不明'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">作成日時</p>
                    <p className="text-sm text-muted-foreground">{formatDate(document.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">更新日時</p>
                    <p className="text-sm text-muted-foreground">{formatDate(document.updated_at)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">バージョン</p>
                    <p className="text-sm text-muted-foreground">v{document.version}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">タグ</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {document.tags.length > 0 ? (
                        document.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">なし</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                閉じる
              </Button>
              <Button onClick={() => {
                onEdit(document.document_id);
                onClose();
              }}>
                編集
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            文書が見つかりません
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}