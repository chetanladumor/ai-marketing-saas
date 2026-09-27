export type DocumentSourceType = 'WEBSITE' | 'PDF' | 'DOCX' | 'FAQ' | 'MANUAL';

export interface IngestDocumentInput {
  organizationId: string;
  title: string;
  sourceType: DocumentSourceType;
  sourceUrl?: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface DocumentChunkData {
  id?: string;
  organizationId: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  metadata: {
    title: string;
    sourceType: DocumentSourceType;
    sourceUrl?: string;
    section?: string;
    tokenCount?: number;
    [key: string]: any;
  };
  embedding?: number[];
}

export interface HybridSearchResult {
  chunk: DocumentChunkData;
  vectorScore: number;
  keywordScore: number;
  rrfScore: number;
  citation: AttributedCitation;
}

export interface AttributedCitation {
  sourceTitle: string;
  sourceType: DocumentSourceType;
  sourceUrl?: string;
  section?: string;
  matchedSnippet: string;
}

export interface RAGContext {
  formattedContext: string;
  citations: AttributedCitation[];
  hasContext: boolean;
}
