'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Header from '@/components/layout/Header';
import DocumentList from '@/components/documents/DocumentList';
import DocumentFilters from '@/components/documents/DocumentFilters';
import Pagination from '@/components/documents/Pagination';
import DocumentDetailModal from '@/components/documents/DocumentDetailModal';
import DocumentEditForm from '@/components/documents/DocumentEditForm';
import DocumentDeleteDialog from '@/components/documents/DocumentDeleteDialog';
import { Button } from '@/components/ui/button';
import { getDocuments } from '@/lib/api/documents';
import { DocumentFilter, DocumentListItem, PageInfo } from '@/types/document';
import { toast } from 'sonner';
import { FileText, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const initialPageInfo: PageInfo = {
  page: 1,
  page_size: 20,
  total_count: 0,
  total_pages: 0
};

const initialFilters: DocumentFilter = {
  page: 1,
  page_size: 20
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>(initialPageInfo);
  const [filters, setFilters] = useState<DocumentFilter>(initialFilters);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [viewDocumentId, setViewDocumentId] = useState<string | null>(null);
  const [editDocumentId, setEditDocumentId] = useState<string | null>(null);
  const [deleteDocumentId, setDeleteDocumentId] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getDocuments(filters);
      setDocuments(response.documents);
      setPageInfo(response.page_info);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '文書一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleFiltersChange = (newFilters: DocumentFilter) => {
    setFilters({ ...newFilters, page: 1, page_size: filters.page_size });
  };

  const handleResetFilters = () => {
    setFilters({ ...initialFilters, page_size: filters.page_size });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters({ ...filters, page: 1, page_size: pageSize });
  };

  const handleRefresh = () => {
    fetchDocuments();
  };

  const handleSuccess = () => {
    fetchDocuments();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <FileText className="h-8 w-8" />
                文書管理
              </h1>
              <p className="text-muted-foreground mt-1">
                アップロードされた文書を管理します
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                更新
              </Button>
              <Link href="/">
                <Button>
                  新規アップロード
                </Button>
              </Link>
            </div>
          </div>

          {/* Filters */}
          <DocumentFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleResetFilters}
          />

          {/* Document List */}
          {loading && documents.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">読み込み中...</p>
              </div>
            </div>
          ) : (
            <>
              <DocumentList
                documents={documents}
                onView={setViewDocumentId}
                onEdit={setEditDocumentId}
                onDelete={setDeleteDocumentId}
              />

              {/* Pagination */}
              {pageInfo.total_count > 0 && (
                <Pagination
                  pageInfo={pageInfo}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              )}
            </>
          )}
        </div>

        {/* Modals */}
        <DocumentDetailModal
          documentId={viewDocumentId}
          isOpen={!!viewDocumentId}
          onClose={() => setViewDocumentId(null)}
          onEdit={setEditDocumentId}
        />

        <DocumentEditForm
          documentId={editDocumentId}
          isOpen={!!editDocumentId}
          onClose={() => setEditDocumentId(null)}
          onSuccess={handleSuccess}
        />

        <DocumentDeleteDialog
          documentId={deleteDocumentId}
          isOpen={!!deleteDocumentId}
          onClose={() => setDeleteDocumentId(null)}
          onSuccess={handleSuccess}
        />
      </main>
    </div>
  );
}