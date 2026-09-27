import { DocumentChunkData, HybridSearchResult } from './types.js';

export class HybridRetriever {
  private static readonly RRF_K = 60; // Standard reciprocal rank fusion smoothing constant

  /**
   * Calculates cosine similarity between two vector embeddings
   */
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  /**
   * Calculates keyword matching score based on term frequency and exact phrase hits
   */
  static keywordMatchScore(query: string, content: string): number {
    const cleanQuery = query.toLowerCase();
    const cleanContent = content.toLowerCase();

    // Direct phrase match bonus
    let score = 0;
    if (cleanContent.includes(cleanQuery)) {
      score += 1.0;
    }

    // Token frequency matching
    const queryTokens = cleanQuery
      .split(/\W+/)
      .filter((t) => t.length > 2); // Ignore single/two letter noise

    if (queryTokens.length === 0) return score;

    let matchedTokens = 0;
    for (const token of queryTokens) {
      if (cleanContent.includes(token)) {
        matchedTokens++;
      }
    }

    score += matchedTokens / queryTokens.length;
    return score;
  }

  /**
   * Executes hybrid search using Reciprocal Rank Fusion (RRF)
   */
  static hybridSearch(
    query: string,
    queryEmbedding: number[],
    chunks: DocumentChunkData[],
    topK: number = 5
  ): HybridSearchResult[] {
    if (chunks.length === 0) return [];

    // 1. Vector Scoring & Ranking
    const vectorScored = chunks
      .map((chunk) => {
        const sim = chunk.embedding ? this.cosineSimilarity(queryEmbedding, chunk.embedding) : 0;
        return { chunk, score: sim };
      })
      .sort((a, b) => b.score - a.score);

    const vectorRankMap = new Map<string, { rank: number; score: number }>();
    vectorScored.forEach((item, index) => {
      const key = `${item.chunk.documentId}_${item.chunk.chunkIndex}`;
      vectorRankMap.set(key, { rank: index + 1, score: item.score });
    });

    // 2. Keyword Scoring & Ranking
    const keywordScored = chunks
      .map((chunk) => {
        const kwScore = this.keywordMatchScore(query, chunk.content);
        return { chunk, score: kwScore };
      })
      .sort((a, b) => b.score - a.score);

    const keywordRankMap = new Map<string, { rank: number; score: number }>();
    keywordScored.forEach((item, index) => {
      const key = `${item.chunk.documentId}_${item.chunk.chunkIndex}`;
      keywordRankMap.set(key, { rank: index + 1, score: item.score });
    });

    // 3. Reciprocal Rank Fusion (RRF) Blending
    const fusedResults: HybridSearchResult[] = chunks.map((chunk) => {
      const key = `${chunk.documentId}_${chunk.chunkIndex}`;
      const vInfo = vectorRankMap.get(key) || { rank: chunks.length, score: 0 };
      const kInfo = keywordRankMap.get(key) || { rank: chunks.length, score: 0 };

      // RRF formula: 1 / (k + rank_vector) + 1 / (k + rank_keyword)
      const rrfScore =
        1 / (HybridRetriever.RRF_K + vInfo.rank) +
        1 / (HybridRetriever.RRF_K + kInfo.rank);

      const snippet = chunk.content.length > 200 ? chunk.content.slice(0, 200) + '...' : chunk.content;

      return {
        chunk,
        vectorScore: Number(vInfo.score.toFixed(4)),
        keywordScore: Number(kInfo.score.toFixed(4)),
        rrfScore: Number(rrfScore.toFixed(6)),
        citation: {
          sourceTitle: chunk.metadata.title,
          sourceType: chunk.metadata.sourceType,
          sourceUrl: chunk.metadata.sourceUrl,
          section: chunk.metadata.section,
          matchedSnippet: snippet,
        },
      };
    });

    // Sort descending by RRF score and return topK
    return fusedResults.sort((a, b) => b.rrfScore - a.rrfScore).slice(0, topK);
  }
}
