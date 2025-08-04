'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getDocument, deleteDocument } from '@/lib/api/documents';
import { Document } from '@/types/document';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface DocumentDeleteDialogProps {
  documentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DocumentDeleteDialog({
  documentId,
  isOpen,
  onClose,
  onSuccess
}: DocumentDeleteDialogProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentId) return;
      
      setLoading(true);
      try {
        const data = await getDocument(documentId);
        setDocument(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '文書の取得に失敗しました');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (documentId && isOpen) {
      fetchDocument();
    }
  }, [documentId, isOpen, onClose]);

  const handleDelete = async () => {
    if (!documentId) return;

    setDeleting(true);
    try {
      await deleteDocument(documentId);
      toast.success('文書を削除しました');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '文書の削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>文書の削除</DialogTitle>
          <DialogDescription>
            この文書を削除してもよろしいですか？
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">読み込み中...</div>
        ) : document ? (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                この操作は取り消せません。文書とそれに関連するすべてのデータが完全に削除されます。
              </AlertDescription>
            </Alert>

            <div className="space-y-2 p-4 bg-muted rounded-md">
              <p className="font-medium">削除する文書:</p>
              <p className="text-sm">{document.title}</p>
              <p className="text-xs text-muted-foreground">
                ファイル: {document.file_name} ({(document.file_size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            文書が見つかりません
          </div>
        )}

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={deleting}
          >
            キャンセル
          </Button>
          <Button 
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || deleting || !document}
          >
            {deleting ? '削除中...' : '削除'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}