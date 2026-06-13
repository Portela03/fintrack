import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IChatPort,
  ICategorizationPort,
  IInsightPort,
  ChatMessage,
} from '../../application/ports/i-llm.port';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: { content: string };
    finish_reason: string;
  }>;
  error?: { message: string; code?: number };
}

@Injectable()
export class OpenRouterAdapter
  implements IChatPort, ICategorizationPort, IInsightPort
{
  private readonly logger = new Logger(OpenRouterAdapter.name);
  private readonly baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private readonly maxRetries = 0;

  constructor(private readonly config: ConfigService) {}

  private get apiKey(): string {
    const key = this.config.get<string>('OPENROUTER_API_KEY', '');
    if (!key) {
      throw new ServiceUnavailableException(
        'OPENROUTER_API_KEY não configurada. Cadastre-se em https://openrouter.ai/keys e adicione a chave no .env.',
      );
    }
    return key;
  }

  private get model(): string {
    return this.config.get<string>(
      'OPENROUTER_MODEL',
      'meta-llama/llama-3.3-70b-instruct:free',
    );
  }

  private async callApi(messages: OpenRouterMessage[]): Promise<string> {
    const model = this.model;
    this.logger.log(
      `→ OpenRouter POST ${this.baseUrl} | model=${model} | messages=${messages.length}`,
    );

    const startMs = Date.now();
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/fintrack-api',
        'X-Title': 'FinTrack API',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    const elapsedMs = Date.now() - startMs;
    this.logger.log(
      `← OpenRouter ${response.status} ${response.statusText} | ${elapsedMs}ms`,
    );

    const data = (await response.json()) as OpenRouterResponse;

    if (!response.ok) {
      const errMsg = data.error?.message ?? `HTTP ${response.status}`;
      this.logger.error(`OpenRouter erro: ${errMsg}`);
      throw new Error(`[${response.status}] ${errMsg}`);
    }

    if (data.error) {
      this.logger.error(`OpenRouter erro no body: ${data.error.message}`);
      throw new Error(data.error.message);
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      this.logger.error('OpenRouter retornou resposta vazia (sem choices)');
      throw new Error('Resposta vazia da API OpenRouter');
    }

    this.logger.log(
      `OpenRouter resposta OK | chars=${content.length} | finish_reason=${data.choices[0].finish_reason}`,
    );

    return content.trim();
  }

  private extractRetrySeconds(msg: string): number {
    const match = msg.match(/retry.{1,10}(\d+)\s*s/i);
    return match ? parseInt(match[1], 10) : 60;
  }

  private isRateLimitError(status: string): boolean {
    return status.includes('429') || status.toLowerCase().includes('rate limit');
  }

  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        const msg = error instanceof Error ? error.message : String(error);

        if (this.isRateLimitError(msg)) {
          const waitSeconds = this.extractRetrySeconds(msg);
          throw new HttpException(
            {
              statusCode: HttpStatus.TOO_MANY_REQUESTS,
              message: `Limite de requisições do OpenRouter atingido. Tente novamente em ${waitSeconds} segundos.`,
              retryAfterSeconds: waitSeconds,
            },
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }

        if (msg.includes('401')) {
          throw new ServiceUnavailableException(
            'OPENROUTER_API_KEY inválida. Verifique a chave em https://openrouter.ai/keys.',
          );
        }

        if (msg.includes('403')) {
          throw new ServiceUnavailableException(
            'Acesso negado à API OpenRouter (403). Verifique as permissões da chave em https://openrouter.ai/keys.',
          );
        }

        if (msg.includes('402')) {
          throw new ServiceUnavailableException(
            'Créditos insuficientes no OpenRouter. Verifique sua conta em https://openrouter.ai/credits.',
          );
        }

        if (this.isRateLimitError(msg)) {
          const waitSeconds = this.extractRetrySeconds(msg);
          throw new HttpException(
            {
              statusCode: HttpStatus.TOO_MANY_REQUESTS,
              message: `Limite de requisições do OpenRouter atingido. Tente novamente em ${waitSeconds} segundos.`,
              retryAfterSeconds: waitSeconds,
            },
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }

        throw new ServiceUnavailableException(
          `Erro na API OpenRouter: ${msg.substring(0, 200)}`,
        );
      }
    }

    throw lastError;
  }

  async chat(
    history: ChatMessage[],
    message: string,
    systemContext = '',
  ): Promise<string> {
    return this.withRetry(async () => {
      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: `Você é um assistente financeiro pessoal inteligente.
Responda sempre em português brasileiro. Seja objetivo, amigável e útil.
${systemContext}`.trim(),
        },
        ...history.map((h) => ({
          role: h.role === 'model' ? ('assistant' as const) : ('user' as const),
          content: h.content,
        })),
        { role: 'user', content: message },
      ];

      return this.callApi(messages);
    });
  }

  async categorize(description: string, amount: number): Promise<string> {
    return this.withRetry(async () => {
      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content:
            'Você é um categorizador de transações financeiras. Responda APENAS com o nome da categoria, sem explicação.',
        },
        {
          role: 'user',
          content: `Categorize esta transação em UMA das categorias:
Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Vestuário, Investimentos, Transferência, Salário, Outros.

Transação: "${description}" - Valor: R$ ${amount}`,
        },
      ];

      return this.callApi(messages);
    });
  }

  async generateInsights(financialSummary: string): Promise<string> {
    return this.withRetry(async () => {
      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content:
            'Você é um consultor financeiro pessoal. Responda sempre em português brasileiro com insights práticos e personalizados.',
        },
        {
          role: 'user',
          content: `Com base neste resumo financeiro, gere insights personalizados:

${financialSummary}

Forneça:
1. Análise dos gastos
2. Pontos de atenção
3. 3 dicas práticas de economia
4. Avaliação geral da saúde financeira`,
        },
      ];

      return this.callApi(messages);
    });
  }
}
