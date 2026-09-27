import { DocumentChunkData, DocumentSourceType } from './types.js';

export interface ChunkingOptions {
  targetChunkSize?: number; // Target character length (default: 600)
  chunkOverlap?: number;    // Overlap between adjacent chunks (default: 100)
}

export class SemanticChunker {
  /**
   * Splits document text into coherent semantic chunks preserving sentence and section context
   */
  static splitIntoChunks(
    documentId: string,
    organizationId: string,
    title: string,
    sourceType: DocumentSourceType,
    text: string,
    sourceUrl?: string,
    options?: ChunkingOptions
  ): DocumentChunkData[] {
    const targetSize = options?.targetChunkSize ?? 600;
    const overlap = options?.chunkOverlap ?? 100;

    // Split text by paragraphs or double newlines first
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const chunks: DocumentChunkData[] = [];
    let currentChunkText = '';
    let currentSection = 'General';
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
      // Check if paragraph looks like a section heading
      const headingMatch = paragraph.match(/^(?:#{1,4}\s+|[A-Z\s]{4,30}:)(.*)/);
      if (headingMatch) {
        currentSection = paragraph.replace(/^#+\s*/, '').trim();
      }

      // If adding this paragraph exceeds target size and current chunk isn't empty, flush
      if (currentChunkText.length + paragraph.length > targetSize && currentChunkText.length > 0) {
        chunks.push({
          organizationId,
          documentId,
          chunkIndex,
          content: currentChunkText.trim(),
          metadata: {
            title,
            sourceType,
            sourceUrl,
            section: currentSection,
            tokenCount: Math.ceil(currentChunkText.length / 4),
          },
        });
        chunkIndex++;

        // Keep trailing overlap from previous chunk
        const words = currentChunkText.split(' ');
        const overlapWords = words.slice(-Math.max(1, Math.floor(overlap / 6))).join(' ');
        currentChunkText = overlapWords + ' ' + paragraph;
      } else {
        currentChunkText = currentChunkText.length > 0 ? `${currentChunkText}\n\n${paragraph}` : paragraph;
      }
    }

    // Flush any remaining content
    if (currentChunkText.trim().length > 0) {
      chunks.push({
        organizationId,
        documentId,
        chunkIndex,
        content: currentChunkText.trim(),
        metadata: {
          title,
          sourceType,
          sourceUrl,
          section: currentSection,
          tokenCount: Math.ceil(currentChunkText.length / 4),
        },
      });
    }

    return chunks;
  }
}
