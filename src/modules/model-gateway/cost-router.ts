import { BaseModelProvider } from './providers/base.provider.js';
import { OllamaProvider } from './providers/ollama.provider.js';
import { CloudProvider } from './providers/cloud.provider.js';
import { ChatMessage, CompletionOptions, CompletionResult, EmbeddingResult, TaskTier } from './types.js';
import { ModelMode } from '../tenancy/types.js';

export interface RouteRequest {
  tier: TaskTier;
  messages: ChatMessage[];
  options?: CompletionOptions;
  organizationMode?: ModelMode;
  organizationId?: string;
}

export class ModelGateway {
  private localProvider: OllamaProvider;
  private cloudProvider: CloudProvider;

  constructor() {
    this.localProvider = new OllamaProvider();
    this.cloudProvider = new CloudProvider('OPENAI');
  }

  /**
   * Intelligently routes completion requests to local Ollama or Cloud based on cost tier and mode
   */
  async routeCompletion<T = any>(request: RouteRequest): Promise<CompletionResult<T>> {
    const mode = request.organizationMode || 'COST_SAVER_HYBRID';
    const isLocalAvailable = await this.localProvider.isAvailable();
    const isCloudAvailable = await this.cloudProvider.isAvailable();

    // Strategy 1: Explicit Local Only
    if (mode === 'LOCAL_ONLY') {
      if (!isLocalAvailable) {
        throw new Error('Local Ollama instance is offline, and tenant is configured for LOCAL_ONLY mode.');
      }
      return this.localProvider.generateChatCompletion<T>(request.messages, request.tier, request.options);
    }

    // Strategy 2: Max Performance
    if (mode === 'MAX_PERFORMANCE') {
      if (isCloudAvailable) {
        return this.cloudProvider.generateChatCompletion<T>(request.messages, request.tier, request.options);
      }
      if (isLocalAvailable) {
        return this.localProvider.generateChatCompletion<T>(request.messages, request.tier, request.options);
      }
      throw new Error('No AI model providers are currently reachable.');
    }

    // Strategy 3: Cost-Saver Hybrid (Default)
    // Tier 0 (Utility/Classification/Schema Cleanup) -> Prefer Local Ollama ($0)
    if (request.tier === TaskTier.TIER_0_LOCAL_UTILITY) {
      if (isLocalAvailable) {
        return this.localProvider.generateChatCompletion<T>(request.messages, request.tier, request.options);
      }
      if (isCloudAvailable) {
        return this.cloudProvider.generateChatCompletion<T>(request.messages, request.tier, request.options);
      }
    }

    // Tier 1 (Bulk Content / Captions / Emails) -> Local if available, else low cost cloud
    if (request.tier === TaskTier.TIER_1_LOW_COST_CLOUD) {
      if (isLocalAvailable) {
        return this.localProvider.generateChatCompletion<T>(request.messages, request.tier, request.options);
      }
      if (isCloudAvailable) {
        return this.cloudProvider.generateChatCompletion<T>(request.messages, request.tier, request.options);
      }
    }

    // Tier 2 (Frontier Reasoning / High-level Strategist) -> Cloud Frontier if available, fallback to local
    if (request.tier === TaskTier.TIER_2_FRONTIER_REASONING) {
      if (isCloudAvailable) {
        return this.cloudProvider.generateChatCompletion<T>(request.messages, request.tier, request.options);
      }
      if (isLocalAvailable) {
        return this.localProvider.generateChatCompletion<T>(request.messages, request.tier, request.options);
      }
    }

    throw new Error('No AI provider available to fulfill this request.');
  }

  /**
   * Generates embeddings, defaulting to local nomic-embed-text for $0 cost
   */
  async routeEmbedding(text: string, forceCloud: boolean = false): Promise<EmbeddingResult> {
    const isLocalAvailable = await this.localProvider.isAvailable();
    if (!forceCloud && isLocalAvailable) {
      return this.localProvider.generateEmbedding(text);
    }

    const isCloudAvailable = await this.cloudProvider.isAvailable();
    if (isCloudAvailable) {
      return this.cloudProvider.generateEmbedding(text);
    }

    if (isLocalAvailable) {
      return this.localProvider.generateEmbedding(text);
    }

    throw new Error('No embedding model provider is currently available.');
  }

  getLocalProvider(): OllamaProvider {
    return this.localProvider;
  }

  getCloudProvider(): CloudProvider {
    return this.cloudProvider;
  }
}
