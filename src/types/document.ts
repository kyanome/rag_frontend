export interface UploadDocumentParams {
  file: File;
  title?: string;
  category?: string;
  tags?: string;
  author?: string;
  description?: string;
}

export interface DocumentUploadResponse {
  document_id: string;
  title: string;
  file_name: string;
  file_size: number;
  content_type: string;
  created_at: string;
}

export interface ErrorResponse {
  detail: string;
}