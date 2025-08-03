'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface UploadProgressProps {
  progress: number;
  isUploading: boolean;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ progress, isUploading }) => {
  if (!isUploading) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">アップロード中...</span>
        <span className="font-medium">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </div>
    </div>
  );
};

export default UploadProgress;