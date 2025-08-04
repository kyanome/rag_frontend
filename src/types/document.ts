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

export interface DocumentListItem {
  document_id: string;
  title: string;
  file_name: string;
  file_size: number;
  content_type: string;
  category: string | null;
  tags: string[];
  author: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  document_id: string;
  title: string;
  file_name: string;
  file_size: number;
  content_type: string;
  category: string | null;
  tags: string[];
  author: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface PageInfo {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export interface DocumentListResponse {
  documents: DocumentListItem[];
  page_info: PageInfo;
}

export interface DocumentFilter {
  title?: string;
  category?: string;
  tags?: string[];
  author?: string;
  created_after?: string;
  created_before?: string;
  page?: number;
  page_size?: number;
}

export interface UpdateDocumentParams {
  title?: string;
  category?: string;
  tags?: string[];
  author?: string;
  description?: string;
}