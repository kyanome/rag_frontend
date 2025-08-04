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
import { Badge } from '@/components/ui/badge';
import { getDocument, updateDocument } from '@/lib/api/documents';
import { Document, UpdateDocumentParams } from '@/types/document';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface DocumentEditFormProps {
  documentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const categories = [
  '技術文書',
  '仕様書',
  '契約書',
  'マニュアル',
  'レポート',
  'その他'
];

export default function DocumentEditForm({
  documentId,
  isOpen,
  onClose,
  onSuccess
}: DocumentEditFormProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateDocumentParams>({
    title: '',
    category: '',
    tags: [],
    author: '',
    description: ''
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentId) return;
      
      setLoading(true);
      try {
        const data = await getDocument(documentId);
        setDocument(data);
        setFormData({
          title: data.title,
          category: data.category || '',
          tags: data.tags,
          author: data.author || '',
          description: data.description || ''
        });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentId) return;

    setSaving(true);
    try {
      await updateDocument(documentId, formData);
      toast.success('文書を更新しました');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '文書の更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...(formData.tags || []), tagInput.trim()]
        });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>文書を編集</DialogTitle>
            <DialogDescription>
              文書のメタデータを編集します
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="py-8 text-center">読み込み中...</div>
          ) : document ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">タイトル</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">カテゴリ</Label>
                <Select
                  value={formData.category || ''}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="カテゴリを選択" />
                  </SelectTrigger>
                  <SelectContent>
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
                  value={formData.author || ''}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">説明</Label>
                <textarea
                  id="description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">タグ</Label>
                <div className="space-y-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="タグを入力してEnterキーで追加"
                  />
                  <div className="flex flex-wrap gap-1">
                    {formData.tags?.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag}
                        <X className="ml-1 h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              文書が見つかりません
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={loading || saving}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}