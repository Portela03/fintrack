import { ConfigService } from '@nestjs/config';
import { IChatPort, ICategorizationPort, IInsightPort, ChatMessage } from '../../application/ports/i-llm.port';
export declare class GeminiAdapter implements IChatPort, ICategorizationPort, IInsightPort {
    private readonly config;
    private readonly logger;
    private _genAI;
    private readonly modelName;
    private readonly maxRetries;
    private readonly safetySettings;
    constructor(config: ConfigService);
    private get genAI();
    private extractRetrySeconds;
    private isRateLimitError;
    private isPermanentQuotaError;
    private withRetry;
    chat(history: ChatMessage[], message: string, systemContext?: string): Promise<string>;
    categorize(description: string, amount: number): Promise<string>;
    generateInsights(financialSummary: string): Promise<string>;
}
