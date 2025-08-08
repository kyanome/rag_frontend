import { AxiosError } from 'axios';
import axiosInstance from '@/lib/axios';
import { 
  UploadDocumentParams, 
  DocumentUploadResponse, 
  ErrorResponse,
  DocumentListResponse,
  DocumentFilter,
  Document,
  UpdateDocumentParams
} from '@/types/document';

export const uploadDocument = async (params: UploadDocumentParams): Promise<DocumentUploadResponse> => {
  const formData = new FormData();
  formData.append('file', params.file);
  
  if (params.title) formData.append('title', params.title);
  if (params.category) formData.append('category', params.category);
  if (params.tags) formData.append('tags', params.tags);
  if (params.author) formData.append('author', params.author);
  if (params.description) formData.append('description', params.description);

  try {
    const response = await axiosInstance.post<DocumentUploadResponse>(
      '/api/v1/documents/',
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
    if ((error as any).isAxiosError || (error as any).response) {
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

export const getDocuments = async (filters?: DocumentFilter): Promise<DocumentListResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.title) params.append('title', filters.title);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.tags) filters.tags.forEach(tag => params.append('tags', tag));
    if (filters?.author) params.append('author', filters.author);
    if (filters?.created_after) params.append('created_after', filters.created_after);
    if (filters?.created_before) params.append('created_before', filters.created_before);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.page_size) params.append('page_size', filters.page_size.toString());

    const response = await axiosInstance.get<DocumentListResponse>(
      `/api/v1/documents/?${params.toString()}`
    );

    return response.data;
  } catch (error) {
    if ((error as any).isAxiosError || (error as any).response) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.detail) {
        throw new Error(axiosError.response.data.detail);
      }
    }
    throw new Error('文書一覧の取得中にエラーが発生しました');
  }
};

export const getDocument = async (documentId: string): Promise<Document> => {
  try {
    const response = await axiosInstance.get<Document>(
      `/api/v1/documents/${documentId}`
    );
    return response.data;
  } catch (error) {
    if ((error as any).isAxiosError || (error as any).response) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.status === 404) {
        throw new Error('文書が見つかりません');
      } else if (axiosError.response?.data?.detail) {
        throw new Error(axiosError.response.data.detail);
      }
    }
    throw new Error('文書の取得中にエラーが発生しました');
  }
};

export const updateDocument = async (
  documentId: string, 
  params: UpdateDocumentParams
): Promise<Document> => {
  try {
    const response = await axiosInstance.put<Document>(
      `/api/v1/documents/${documentId}`,
      params
    );
    return response.data;
  } catch (error) {
    if ((error as any).isAxiosError || (error as any).response) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.status === 404) {
        throw new Error('文書が見つかりません');
      } else if (axiosError.response?.status === 400) {
        throw new Error('無効な入力データです');
      } else if (axiosError.response?.data?.detail) {
        throw new Error(axiosError.response.data.detail);
      }
    }
    throw new Error('文書の更新中にエラーが発生しました');
  }
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/v1/documents/${documentId}`);
  } catch (error) {
    if ((error as any).isAxiosError || (error as any).response) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.status === 404) {
        throw new Error('文書が見つかりません');
      } else if (axiosError.response?.data?.detail) {
        throw new Error(axiosError.response.data.detail);
      }
    }
    throw new Error('文書の削除中にエラーが発生しました');
  }
};