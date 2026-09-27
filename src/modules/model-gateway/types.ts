export enum TaskTier {
  TIER_0_LOCAL_UTILITY = 'TIER_0_LOCAL_UTILITY',       // Extraction, classification, schema cleaning (Free / Local)
  TIER_1_LOW_COST_CLOUD = 'TIER_1_LOW_COST_CLOUD',     // Bulk drafts, social captions, email text (Micro-cents)
  TIER_2_FRONTIER_REASONING = 'TIER_2_FRONTIER_REASONING', // Strategist Supervisor, complex LangGraph decisions
}

export type ModelProviderType = 'OLLAMA' | 'OPENAI' | 'ANTHROPIC' | 'GEMINI' | 'GROQ' | 'DEEPSEEK';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json' | 'text';
  systemPrompt?: string;
  timeout?: number;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export interface CompletionResult<T = any> {
  text: string;
  data?: T;
  usage: TokenUsage;
  provider: ModelProviderType;
  model: string;
  tier: TaskTier;
  latencyMs: number;
}

export interface EmbeddingResult {
  embedding: number[];
  dimensions: number;
  model: string;
  latencyMs: number;
}

export interface ModelPricing {
  promptCostPerMillion: number;
  completionCostPerMillion: number;
}
