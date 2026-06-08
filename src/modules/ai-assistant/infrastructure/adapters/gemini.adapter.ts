import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import {
  IChatPort,
  ICategorizationPort,
  IInsightPort,
  ChatMessage,
} from '../../application/ports/i-llm.port';

@Injectable()
export class GeminiAdapter
  implements IChatPort, ICategorizationPort, IInsightPort
{
  private readonly logger = new Logger(GeminiAdapter.name);
  private _genAI: GoogleGenerativeAI | null = null;
  private readonly modelName = 'gemini-2.0-flash';
  private readonly maxRetries = 2;

  private readonly safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ];

  constructor(private readonly config: ConfigService) {}

  private get genAI(): GoogleGenerativeAI {
    if (!this._genAI) {
      const apiKey = this.config.get<string>('GEMINI_API_KEY', '');
      if (!apiKey) {
        throw new ServiceUnavailableException(
          'GEMINI_API_KEY não configurada. Adicione a chave no arquivo .env e reinicie o servidor.',
        );
      }
      this._genAI = new GoogleGenerativeAI(apiKey);
    }
    return this._genAI;
  }

  private extractRetrySeconds(msg: string): number {
    const match = msg.match(/retry in ([\d.]+)s/);
    return match ? Math.ceil(parseFloat(match[1])) : 60;
  }

  private isRateLimitError(msg: string): boolean {
    return msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('quota');
  }

  // "limit: 0" significa que o free tier está desabilitado para esta chave.
  // Não adianta fazer retry — é um problema permanente de configuração.
  private isPermanentQuotaError(msg: string): boolean {
    return msg.includes('limit: 0') || msg.includes('limit":0');
  }

  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        const msg = error instanceof Error ? error.message : String(error);

        if (this.isRateLimitError(msg) && attempt < this.maxRetries) {
          // "limit: 0" = free tier desabilitado para esta chave. Não é temporário — não tente novamente.
          if (this.isPermanentQuotaError(msg)) {
            this.logger.error(
              'GEMINI_API_KEY sem acesso ao free tier (limit: 0). Gere uma nova chave em aistudio.google.com/apikey',
            );
            throw new ServiceUnavailableException(
              'A chave GEMINI_API_KEY não tem acesso ao free tier da API Gemini. ' +
              'Gere uma nova chave em https://aistudio.google.com/apikey (não use o Google Cloud Console).',
            );
          }

          const waitSeconds = this.extractRetrySeconds(msg);
          // Cap wait to 65s max to avoid hanging the request indefinitely
          const waitMs = Math.min(waitSeconds * 1000, 65_000);
          this.logger.warn(
            `Gemini rate limit (tentativa ${attempt + 1}/${this.maxRetries + 1}). Aguardando ${waitSeconds}s...`,
          );
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          continue;
        }

        // Non-rate-limit error or last attempt — throw immediately
        if (msg.includes('401') || msg.includes('API key')) {
          throw new ServiceUnavailableException(
            'GEMINI_API_KEY inválida. Verifique a chave em aistudio.google.com/apikey.',
          );
        }
        if (msg.includes('404')) {
          throw new ServiceUnavailableException(
            `Modelo "${this.modelName}" não encontrado. Verifique se a chave tem acesso à API Gemini.`,
          );
        }
        if (this.isRateLimitError(msg)) {
          // Também verificar permanente antes do throw final
          if (this.isPermanentQuotaError(msg)) {
            throw new ServiceUnavailableException(
              'A chave GEMINI_API_KEY não tem acesso ao free tier da API Gemini. ' +
              'Gere uma nova chave em https://aistudio.google.com/apikey (não use o Google Cloud Console).',
            );
          }
          const waitSeconds = this.extractRetrySeconds(msg);
          throw new HttpException(
            {
              statusCode: HttpStatus.TOO_MANY_REQUESTS,
              message: `Limite de requisições da API Gemini atingido após ${this.maxRetries + 1} tentativas. Tente novamente em ${waitSeconds} segundos.`,
              retryAfterSeconds: waitSeconds,
            },
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
        throw new ServiceUnavailableException(
          `Erro na API Gemini: ${msg.substring(0, 200)}`,
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
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        safetySettings: this.safetySettings,
        systemInstruction: `Você é um assistente financeiro pessoal inteligente. 
Responda sempre em português brasileiro. Seja objetivo, amigável e útil.
${systemContext}`,
      });

      const chat = model.startChat({
        history: history.map((h) => ({
          role: h.role,
          parts: [{ text: h.content }],
        })),
      });

      const result = await chat.sendMessage(message);
      return result.response.text();
    });
  }

  async categorize(description: string, amount: number): Promise<string> {
    return this.withRetry(async () => {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      const prompt = `Categorize esta transação financeira em UMA das categorias:
Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Vestuário, 
Investimentos, Transferência, Salário, Outros.

Transação: "${description}" - Valor: R$ ${amount}
Responda APENAS com o nome da categoria, sem explicação.`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    });
  }

  async generateInsights(financialSummary: string): Promise<string> {
    return this.withRetry(async () => {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      const prompt = `Com base neste resumo financeiro, gere insights personalizados em português:

${financialSummary}

Forneça:
1. Análise dos gastos
2. Pontos de atenção
3. 3 dicas práticas de economia
4. Avaliação geral da saúde financeira`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    });
  }
}
