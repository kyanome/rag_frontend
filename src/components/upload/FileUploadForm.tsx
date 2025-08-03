'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Upload } from 'lucide-react';
import FileDropzone from './FileDropzone';
import UploadProgress from './UploadProgress';
import { uploadDocument } from '@/lib/api/documents';
import { DocumentUploadResponse } from '@/types/document';

const FileUploadForm: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    tags: '',
    author: '',
    description: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    data?: DocumentUploadResponse;
  } | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadResult(null);
    // ファイル名からタイトルを自動設定
    if (!formData.title) {
      setFormData(prev => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, ''), // 拡張子を除いたファイル名
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setUploadResult({
        success: false,
        message: 'ファイルを選択してください',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    // Upload progress simulation (実際のprogress eventはAPI clientで処理)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const response = await uploadDocument({
        file: selectedFile,
        ...formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      setUploadResult({
        success: true,
        message: '文書が正常にアップロードされました',
        data: response,
      });

      // フォームをリセット
      setSelectedFile(null);
      setFormData({
        title: '',
        category: '',
        tags: '',
        author: '',
        description: '',
      });
    } catch (error) {
      clearInterval(progressInterval);
      setUploadResult({
        success: false,
        message: error instanceof Error ? error.message : 'アップロード中にエラーが発生しました',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>文書アップロード</CardTitle>
        <CardDescription>
          RAGシステムに文書をアップロードして、AIによる検索と回答生成を可能にします
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ファイル選択 */}
          <div className="space-y-2">
            <Label>ファイル選択</Label>
            <FileDropzone 
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              disabled={isUploading}
            />
          </div>

          {/* メタデータ入力 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">タイトル</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="文書のタイトル"
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">カテゴリ</Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="例: 技術仕様書"
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">作成者</Label>
              <Input
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="文書の作成者"
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">タグ（カンマ区切り）</Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="例: AI, 機械学習, RAG"
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">説明</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="文書の簡単な説明"
                disabled={isUploading}
              />
            </div>
          </div>

          {/* アップロード進捗 */}
          {isUploading && (
            <UploadProgress progress={uploadProgress} isUploading={isUploading} />
          )}

          {/* 結果表示 */}
          {uploadResult && (
            <Alert variant={uploadResult.success ? 'default' : 'destructive'}>
              {uploadResult.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {uploadResult.success ? 'アップロード成功' : 'アップロードエラー'}
              </AlertTitle>
              <AlertDescription>
                {uploadResult.message}
                {uploadResult.data && (
                  <div className="mt-2 text-sm">
                    <p>文書ID: {uploadResult.data.document_id}</p>
                    <p>ファイル名: {uploadResult.data.file_name}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* 送信ボタン */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <>アップロード中...</>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                文書をアップロード
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FileUploadForm;