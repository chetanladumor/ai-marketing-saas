import { BaseModelProvider } from './base.provider.js';
import { ChatMessage, CompletionOptions, CompletionResult, EmbeddingResult, ModelProviderType, TaskTier } from '../types.js';

export class OllamaProvider extends BaseModelProvider {
  readonly providerType: ModelProviderType = 'OLLAMA';
  readonly defaultModel: string;
  readonly embeddingModel: string;
  private readonly baseUrl: string;

  constructor(
    baseUrl: string = process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    defaultModel: string = process.env.OLLAMA_COMPLETION_MODEL || 'llama3.1:latest',
    embeddingModel: string = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text:latest'
  ) {
    super();
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.defaultModel = defaultModel;
    this.embeddingModel = embeddingModel;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async generateChatCompletion<T = any>(
    messages: ChatMessage[],
    tier: TaskTier = TaskTier.TIER_0_LOCAL_UTILITY,
    options?: CompletionOptions
  ): Promise<CompletionResult<T>> {
    const startTime = Date.now();
    const model = this.defaultModel;

    const formattedMessages = [...messages];
    if (options?.systemPrompt) {
      formattedMessages.unshift({ role: 'system', content: options.systemPrompt });
    }

    const payload: Record<string, any> = {
      model,
      messages: formattedMessages,
      stream: false,
      options: {
        temperature: options?.temperature ?? 0.2,
        num_predict: options?.maxTokens ?? 768,
      },
    };

    if (options?.responseFormat === 'json') {
      payload.format = 'json';
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: options?.timeout ? AbortSignal.timeout(options.timeout) : undefined,
      });
    } catch (fetchErr: any) {
      console.error(`[Ollama Error] Chat completion fetch failed:`, fetchErr);
      throw fetchErr;
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama API error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as any;
    const latencyMs = Date.now() - startTime;

    const rawText = data.message?.content || '';
    let parsedData: T | undefined = undefined;

    if (options?.responseFormat === 'json' && rawText) {
      try {
        parsedData = JSON.parse(rawText) as T;
      } catch (err) {
        // Fallback: Attempt extraction if wrapped in code block
        const match = rawText.match(/```json([\s\S]*?)```/) || rawText.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            parsedData = JSON.parse(match[1] || match[0]) as T;
          } catch {
            // Raw text retained
          }
        }
      }
    }

    const promptTokens = data.prompt_eval_count || Math.ceil(JSON.stringify(messages).length / 4);
    const completionTokens = data.eval_count || Math.ceil(rawText.length / 4);

    return {
      text: rawText,
      data: parsedData,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        estimatedCostUsd: 0.0, // Local Ollama is 100% Free
      },
      provider: this.providerType,
      model,
      tier,
      latencyMs,
    };
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const startTime = Date.now();
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.embeddingModel,
        prompt: text,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama Embedding error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as any;
    const latencyMs = Date.now() - startTime;

    return {
      embedding: data.embedding || [],
      dimensions: (data.embedding || []).length,
      model: this.embeddingModel,
      latencyMs,
    };
  }

  calculateCost(): number {
    return 0.0; // Local execution is completely free of charge
  }
}
