import { BaseModelProvider } from './base.provider.js';
import { ChatMessage, CompletionOptions, CompletionResult, EmbeddingResult, ModelPricing, ModelProviderType, TaskTier } from '../types.js';

export class CloudProvider extends BaseModelProvider {
  readonly providerType: ModelProviderType;
  readonly defaultModel: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;

  private static readonly PRICING_TABLE: Record<string, ModelPricing> = {
    // Tier 1 - Low cost
    'gpt-4o-mini': { promptCostPerMillion: 0.15, completionCostPerMillion: 0.60 },
    'gemini-1.5-flash': { promptCostPerMillion: 0.075, completionCostPerMillion: 0.30 },
    'deepseek-chat': { promptCostPerMillion: 0.14, completionCostPerMillion: 0.28 },
    // Tier 2 - Frontier reasoning
    'gpt-4o': { promptCostPerMillion: 2.50, completionCostPerMillion: 10.00 },
    'claude-3-5-sonnet': { promptCostPerMillion: 3.00, completionCostPerMillion: 15.00 },
  };

  constructor(
    providerType: ModelProviderType = 'OPENAI',
    apiKey?: string,
    baseUrl?: string,
    defaultModel?: string
  ) {
    super();
    this.providerType = providerType;
    this.apiKey = apiKey || process.env[`${providerType}_API_KEY`] || '';
    this.baseUrl = (baseUrl || this.getDefaultBaseUrl(providerType)).replace(/\/$/, '');
    this.defaultModel = defaultModel || this.getDefaultModel(providerType);
  }

  private getDefaultBaseUrl(type: ModelProviderType): string {
    switch (type) {
      case 'OPENAI':
        return 'https://api.openai.com/v1';
      case 'GROQ':
        return 'https://api.groq.com/openai/v1';
      case 'DEEPSEEK':
        return 'https://api.deepseek.com/v1';
      default:
        return 'https://api.openai.com/v1';
    }
  }

  private getDefaultModel(type: ModelProviderType): string {
    switch (type) {
      case 'OPENAI':
        return 'gpt-4o-mini';
      case 'GROQ':
        return 'llama-3.1-8b-instant';
      case 'DEEPSEEK':
        return 'deepseek-chat';
      default:
        return 'gpt-4o-mini';
    }
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async generateChatCompletion<T = any>(
    messages: ChatMessage[],
    tier: TaskTier = TaskTier.TIER_1_LOW_COST_CLOUD,
    options?: CompletionOptions
  ): Promise<CompletionResult<T>> {
    const startTime = Date.now();
    const model = this.getModelForTier(tier);

    if (!this.apiKey) {
      throw new Error(`API key for ${this.providerType} is not configured.`);
    }

    const formattedMessages = [...messages];
    if (options?.systemPrompt) {
      formattedMessages.unshift({ role: 'system', content: options.systemPrompt });
    }

    const payload: Record<string, any> = {
      model,
      messages: formattedMessages,
      temperature: options?.temperature ?? 0.3,
    };

    if (options?.responseFormat === 'json') {
      payload.response_format = { type: 'json_object' };
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`${this.providerType} API error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as any;
    const latencyMs = Date.now() - startTime;
    const rawText = data.choices?.[0]?.message?.content || '';

    let parsedData: T | undefined = undefined;
    if (options?.responseFormat === 'json' && rawText) {
      try {
        parsedData = JSON.parse(rawText) as T;
      } catch (err) {
        // Fallback parser
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            parsedData = JSON.parse(match[0]) as T;
          } catch {}
        }
      }
    }

    const promptTokens = data.usage?.prompt_tokens || Math.ceil(JSON.stringify(messages).length / 4);
    const completionTokens = data.usage?.completion_tokens || Math.ceil(rawText.length / 4);
    const estimatedCostUsd = this.calculateCost(promptTokens, completionTokens, model);

    return {
      text: rawText,
      data: parsedData,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        estimatedCostUsd,
      },
      provider: this.providerType,
      model,
      tier,
      latencyMs,
    };
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const startTime = Date.now();
    const model = 'text-embedding-3-small';

    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model, input: text }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Embedding API error: ${errText}`);
    }

    const data = (await response.json()) as any;
    const latencyMs = Date.now() - startTime;
    const embedding = data.data?.[0]?.embedding || [];

    return {
      embedding,
      dimensions: embedding.length,
      model,
      latencyMs,
    };
  }

  private getModelForTier(tier: TaskTier): string {
    if (tier === TaskTier.TIER_2_FRONTIER_REASONING) {
      return 'gpt-4o';
    }
    return this.defaultModel; // e.g. gpt-4o-mini
  }

  calculateCost(promptTokens: number, completionTokens: number, model: string): number {
    const pricing = CloudProvider.PRICING_TABLE[model] || {
      promptCostPerMillion: 0.15,
      completionCostPerMillion: 0.60,
    };

    const promptCost = (promptTokens / 1_000_000) * pricing.promptCostPerMillion;
    const completionCost = (completionTokens / 1_000_000) * pricing.completionCostPerMillion;
    return Number((promptCost + completionCost).toFixed(6));
  }
}
