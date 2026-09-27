import { ModelGateway } from '../model-gateway/cost-router.js';
import { SemanticChunker } from './chunker.js';
import { HybridRetriever } from './hybrid-retriever.js';
import { DocumentChunkData, IngestDocumentInput, RAGContext } from './types.js';
import { v4 as uuidv4 } from 'uuid';

export class RAGService {
  private modelGateway: ModelGateway;
  // In-memory chunk store for fast caching & verification (synced with PostgreSQL / Prisma)
  private memoryChunkStore: Map<string, DocumentChunkData[]> = new Map();

  constructor(modelGateway?: ModelGateway) {
    this.modelGateway = modelGateway || new ModelGateway();
  }

  /**
   * Ingests a business document, chunks it, generates vector embeddings, and stores it
   */
  async ingestDocument(input: IngestDocumentInput): Promise<{ documentId: string; chunkCount: number }> {
    const documentId = uuidv4();

    // 1. Chunk document
    const chunks = SemanticChunker.splitIntoChunks(
      documentId,
      input.organizationId,
      input.title,
      input.sourceType,
      input.content,
      input.sourceUrl
    );

    // 2. Generate vector embeddings for each chunk via Model Gateway (defaults to local nomic-embed-text $0 cost)
    for (const chunk of chunks) {
      const embedResult = await this.modelGateway.routeEmbedding(chunk.content);
      chunk.embedding = embedResult.embedding;
    }

    // 3. Store in tenant memory store
    const existing = this.memoryChunkStore.get(input.organizationId) || [];
    this.memoryChunkStore.set(input.organizationId, [...existing, ...chunks]);

    return {
      documentId,
      chunkCount: chunks.length,
    };
  }

  /**
   * Retrieves hybrid RAG context for a user query with strict tenant isolation
   */
  async retrieveContext(
    organizationId: string,
    query: string,
    topK: number = 4
  ): Promise<RAGContext> {
    const tenantChunks = this.memoryChunkStore.get(organizationId) || [];

    if (tenantChunks.length === 0) {
      return {
        formattedContext: 'No business documentation has been uploaded yet for this organization.',
        citations: [],
        hasContext: false,
      };
    }

    // 1. Embed query
    const queryEmbedResult = await this.modelGateway.routeEmbedding(query);

    // 2. Execute Hybrid Search (Vector Cosine + Keyword Term Match + RRF)
    const hybridResults = HybridRetriever.hybridSearch(
      query,
      queryEmbedResult.embedding,
      tenantChunks,
      topK
    );

    if (hybridResults.length === 0) {
      return {
        formattedContext: '',
        citations: [],
        hasContext: false,
      };
    }

    // 3. Assemble formatted context with source attribution labels
    const contextBlocks = hybridResults.map((result, index) => {
      const c = result.citation;
      return `[Source ${index + 1}: "${c.sourceTitle}" | Section: ${c.section || 'General'} | RRF Score: ${result.rrfScore}]\n${result.chunk.content}`;
    });

    const formattedContext = contextBlocks.join('\n\n---\n\n');
    const citations = hybridResults.map((r) => r.citation);

    return {
      formattedContext,
      citations,
      hasContext: true,
    };
  }

  /**
   * Generates a grounded, hallucination-resistant answer citing sources
   */
  async generateGroundedAnswer(
    organizationId: string,
    userQuery: string
  ): Promise<{ answer: string; citations: any[]; latencyMs: number }> {
    const startTime = Date.now();

    // 1. Retrieve RAG context
    const ragContext = await this.retrieveContext(organizationId, userQuery, 3);

    // 2. Construct grounded prompt
    const systemPrompt = `You are a factual marketing intelligence AI.
Answer the user's question STRICTLY based on the provided business context.
If the context does not contain the answer, explicitly state that the business documents do not mention this information.
Do NOT invent pricing, guarantees, or clinical claims not supported by the context.
Always cite the source document name in your explanation.`;

    const userPrompt = `BUSINESS CONTEXT:
${ragContext.formattedContext}

USER QUESTION:
${userQuery}

Provide a clear, professional answer grounded directly in the context.`;

    // 3. Route to Model Gateway (Tier 0 local llama3.1 for $0 cost)
    const completion = await this.modelGateway.routeCompletion({
      tier: (await import('../model-gateway/types.js')).TaskTier.TIER_0_LOCAL_UTILITY,
      options: {
        systemPrompt,
        temperature: 0.1,
      },
      messages: [{ role: 'user', content: userPrompt }],
    });

    return {
      answer: completion.text,
      citations: ragContext.citations,
      latencyMs: Date.now() - startTime,
    };
  }

  getChunkCount(organizationId: string): number {
    return (this.memoryChunkStore.get(organizationId) || []).length;
  }
}
