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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../identity/infrastructure/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../../identity/infrastructure/decorators/current-user.decorator");
const send_message_use_case_1 = require("../../application/use-cases/send-message/send-message.use-case");
const generate_insights_use_case_1 = require("../../application/use-cases/generate-insights/generate-insights.use-case");
const prisma_service_1 = require("../../../../shared/infrastructure/prisma.service");
const uuid_1 = require("uuid");
class SendMessageDto {
    message;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mensagem para o assistente financeiro', example: 'Quanto gastei em alimentação esse mês?' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "message", void 0);
let AiController = class AiController {
    sendMessage;
    generateInsights;
    prisma;
    constructor(sendMessage, generateInsights, prisma) {
        this.sendMessage = sendMessage;
        this.generateInsights = generateInsights;
        this.prisma = prisma;
    }
    async createSession(user) {
        const session = await this.prisma.chatSession.create({
            data: { id: (0, uuid_1.v4)(), userId: user.sub, title: 'Nova conversa' },
        });
        return session;
    }
    async listSessions(user) {
        return this.prisma.chatSession.findMany({
            where: { userId: user.sub },
            orderBy: { updatedAt: 'desc' },
            select: { id: true, title: true, createdAt: true },
        });
    }
    async chat(sessionId, dto, user) {
        return this.sendMessage.execute({
            userId: user.sub,
            sessionId,
            message: dto.message,
        });
    }
    async getHistory(sessionId) {
        return this.prisma.chatMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' },
            select: { id: true, role: true, content: true, createdAt: true },
        });
    }
    async insights(user) {
        return this.generateInsights.execute({ userId: user.sub });
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('sessions'),
    (0, swagger_1.ApiOperation)({
        summary: 'Criar sessão de chat',
        description: 'Inicia uma nova conversa com o assistente financeiro IA (Gemini 2.0 Flash). Cada sessão mantém histórico de mensagens independente.',
    }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Sessão criada. Retorna `id`, `userId`, `title`, `createdAt`.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "createSession", null);
__decorate([
    (0, common_1.Get)('sessions'),
    (0, swagger_1.ApiOperation)({
        summary: 'Listar sessões de chat',
        description: 'Retorna todas as sessões de conversa do usuário, ordenadas da mais recente para a mais antiga.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Lista de sessões com `id`, `title`, `createdAt`.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "listSessions", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/messages'),
    (0, swagger_1.ApiOperation)({
        summary: 'Enviar mensagem ao assistente',
        description: 'Envia uma mensagem de texto ao assistente financeiro IA. O assistente tem contexto das últimas 20 mensagens da sessão. Pode responder perguntas sobre gastos, orçamentos, metas, financiamentos e dar conselhos financeiros em português.',
    }),
    (0, swagger_1.ApiParam)({ name: 'sessionId', description: 'ID da sessão de chat' }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Resposta do assistente. Retorna `{ userMessage, assistantMessage }`.' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, SendMessageDto, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "chat", null);
__decorate([
    (0, common_1.Get)('sessions/:sessionId/messages'),
    (0, swagger_1.ApiOperation)({
        summary: 'Histórico de mensagens',
        description: 'Retorna todas as mensagens de uma sessão de chat, em ordem cronológica. Cada mensagem tem `role` (user | model) e `content`.',
    }),
    (0, swagger_1.ApiParam)({ name: 'sessionId', description: 'ID da sessão de chat' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Lista de mensagens com `id`, `role`, `content`, `createdAt`.' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('insights'),
    (0, swagger_1.ApiOperation)({
        summary: 'Gerar insights financeiros com IA',
        description: 'Analisa as transações do mês atual, agrupa por categoria e envia para o Gemini 2.0 Flash gerar um relatório com insights, padrões de gastos identificados e recomendações personalizadas em português.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Relatório de insights gerado pela IA em texto.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "insights", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)('7. AI Assistant'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [send_message_use_case_1.SendMessageUseCase,
        generate_insights_use_case_1.GenerateInsightsUseCase,
        prisma_service_1.PrismaService])
], AiController);
//# sourceMappingURL=ai.controller.js.map