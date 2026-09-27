import { ChatMessage, CompletionOptions, CompletionResult, EmbeddingResult, ModelProviderType, TaskTier } from '../types.js';

export abstract class BaseModelProvider {
  abstract readonly providerType: ModelProviderType;
  abstract readonly defaultModel: string;

  abstract isAvailable(): Promise<boolean>;

  abstract generateChatCompletion<T = any>(
    messages: ChatMessage[],
    tier: TaskTier,
    options?: CompletionOptions
  ): Promise<CompletionResult<T>>;

  abstract generateEmbedding(text: string): Promise<EmbeddingResult>;

  /**
   * Calculates the estimated cost in USD based on token counts
   */
  abstract calculateCost(promptTokens: number, completionTokens: number, model: string): number;
}
