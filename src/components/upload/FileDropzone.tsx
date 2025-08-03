'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  acceptedFormats?: string[];
  maxSize?: number; // in bytes
  disabled?: boolean;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  selectedFile,
  acceptedFormats = ['.pdf', '.doc', '.docx', '.txt', '.csv', '.md'],
  maxSize = 100 * 1024 * 1024, // 100MB
  disabled = false,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'text/markdown': ['.md'],
    },
    maxSize,
    multiple: false,
    disabled,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive && 'border-primary bg-primary/5',
          !isDragActive && 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed',
          selectedFile && 'border-green-500 bg-green-50'
        )}
      >
        <input {...getInputProps()} />
        
        {selectedFile ? (
          <div className="flex flex-col items-center space-y-2">
            <FileText className="h-12 w-12 text-green-600" />
            <div className="text-sm font-medium">{selectedFile.name}</div>
            <div className="text-xs text-gray-500">
              {formatFileSize(selectedFile.size)}
            </div>
            <p className="text-xs text-gray-400">
              別のファイルを選択するにはクリックまたはドラッグ＆ドロップ
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Upload className="h-12 w-12 text-gray-400" />
            {isDragActive ? (
              <p className="text-sm text-gray-600">ファイルをドロップしてください</p>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  ファイルをドラッグ＆ドロップするか、クリックして選択
                </p>
                <p className="text-xs text-gray-400">
                  対応形式: PDF, Word, テキスト, CSV, Markdown（最大100MB）
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {fileRejections.length > 0 && (
        <div className="mt-2 text-sm text-red-600">
          {fileRejections[0].errors.map((error) => {
            if (error.code === 'file-too-large') {
              return 'ファイルサイズが大きすぎます（最大100MB）';
            }
            if (error.code === 'file-invalid-type') {
              return '無効なファイル形式です';
            }
            return error.message;
          }).join(', ')}
        </div>
      )}
    </div>
  );
};

export default FileDropzone;