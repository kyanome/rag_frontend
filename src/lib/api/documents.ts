import axios, { AxiosError } from 'axios';
import { UploadDocumentParams, DocumentUploadResponse, ErrorResponse } from '@/types/document';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const uploadDocument = async (params: UploadDocumentParams): Promise<DocumentUploadResponse> => {
  const formData = new FormData();
  formData.append('file', params.file);
  
  if (params.title) formData.append('title', params.title);
  if (params.category) formData.append('category', params.category);
  if (params.tags) formData.append('tags', params.tags);
  if (params.author) formData.append('author', params.author);
  if (params.description) formData.append('description', params.description);

  try {
    const response = await axios.post<DocumentUploadResponse>(
      `${API_URL}/api/v1/documents/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            // This can be used to update a progress bar
            console.log(`Upload Progress: ${progress}%`);
          }
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.detail) {
        throw new Error(axiosError.response.data.detail);
      } else if (axiosError.response?.status === 413) {
        throw new Error('ファイルサイズが大きすぎます（最大100MB）');
      } else if (axiosError.response?.status === 400) {
        throw new Error('無効なファイル形式です');
      }
    }
    throw new Error('アップロード中にエラーが発生しました');
  }
};