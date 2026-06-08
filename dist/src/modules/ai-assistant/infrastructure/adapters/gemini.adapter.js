"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GeminiAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
let GeminiAdapter = GeminiAdapter_1 = class GeminiAdapter {
    config;
    logger = new common_1.Logger(GeminiAdapter_1.name);
    _genAI = null;
    modelName = 'gemini-2.0-flash';
    maxRetries = 2;
    safetySettings = [
        { category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: generative_ai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];
    constructor(config) {
        this.config = config;
    }
    get genAI() {
        if (!this._genAI) {
            const apiKey = this.config.get('GEMINI_API_KEY', '');
            if (!apiKey) {
                throw new common_1.ServiceUnavailableException('GEMINI_API_KEY não configurada. Adicione a chave no arquivo .env e reinicie o servidor.');
            }
            this._genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        }
        return this._genAI;
    }
    extractRetrySeconds(msg) {
        const match = msg.match(/retry in ([\d.]+)s/);
        return match ? Math.ceil(parseFloat(match[1])) : 60;
    }
    isRateLimitError(msg) {
        return msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('quota');
    }
    isPermanentQuotaError(msg) {
        return msg.includes('limit: 0') || msg.includes('limit":0');
    }
    async withRetry(fn) {
        let lastError;
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                return await fn();
            }
            catch (error) {
                lastError = error;
                const msg = error instanceof Error ? error.message : String(error);
                if (this.isRateLimitError(msg) && attempt < this.maxRetries) {
                    if (this.isPermanentQuotaError(msg)) {
                        this.logger.error('GEMINI_API_KEY sem acesso ao free tier (limit: 0). Gere uma nova chave em aistudio.google.com/apikey');
                        throw new common_1.ServiceUnavailableException('A chave GEMINI_API_KEY não tem acesso ao free tier da API Gemini. ' +
                            'Gere uma nova chave em https://aistudio.google.com/apikey (não use o Google Cloud Console).');
                    }
                    const waitSeconds = this.extractRetrySeconds(msg);
                    const waitMs = Math.min(waitSeconds * 1000, 65_000);
                    this.logger.warn(`Gemini rate limit (tentativa ${attempt + 1}/${this.maxRetries + 1}). Aguardando ${waitSeconds}s...`);
                    await new Promise((resolve) => setTimeout(resolve, waitMs));
                    continue;
                }
                if (msg.includes('401') || msg.includes('API key')) {
                    throw new common_1.ServiceUnavailableException('GEMINI_API_KEY inválida. Verifique a chave em aistudio.google.com/apikey.');
                }
                if (msg.includes('404')) {
                    throw new common_1.ServiceUnavailableException(`Modelo "${this.modelName}" não encontrado. Verifique se a chave tem acesso à API Gemini.`);
                }
                if (this.isRateLimitError(msg)) {
                    if (this.isPermanentQuotaError(msg)) {
                        throw new common_1.ServiceUnavailableException('A chave GEMINI_API_KEY não tem acesso ao free tier da API Gemini. ' +
                            'Gere uma nova chave em https://aistudio.google.com/apikey (não use o Google Cloud Console).');
                    }
                    const waitSeconds = this.extractRetrySeconds(msg);
                    throw new common_1.HttpException({
                        statusCode: common_1.HttpStatus.TOO_MANY_REQUESTS,
                        message: `Limite de requisições da API Gemini atingido após ${this.maxRetries + 1} tentativas. Tente novamente em ${waitSeconds} segundos.`,
                        retryAfterSeconds: waitSeconds,
                    }, common_1.HttpStatus.TOO_MANY_REQUESTS);
                }
                throw new common_1.ServiceUnavailableException(`Erro na API Gemini: ${msg.substring(0, 200)}`);
            }
        }
        throw lastError;
    }
    async chat(history, message, systemContext = '') {
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
    async categorize(description, amount) {
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
    async generateInsights(financialSummary) {
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
};
exports.GeminiAdapter = GeminiAdapter;
exports.GeminiAdapter = GeminiAdapter = GeminiAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GeminiAdapter);
//# sourceMappingURL=gemini.adapter.js.map