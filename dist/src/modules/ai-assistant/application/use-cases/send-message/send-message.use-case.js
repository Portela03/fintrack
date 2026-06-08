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
exports.SendMessageUseCase = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../shared/infrastructure/prisma.service");
const i_llm_port_1 = require("../../ports/i-llm.port");
const uuid_1 = require("uuid");
let SendMessageUseCase = class SendMessageUseCase {
    chatPort;
    prisma;
    constructor(chatPort, prisma) {
        this.chatPort = chatPort;
        this.prisma = prisma;
    }
    async execute(input) {
        const historyRows = await this.prisma.chatMessage.findMany({
            where: { sessionId: input.sessionId },
            orderBy: { createdAt: 'asc' },
            take: 20,
        });
        const history = historyRows.map((h) => ({
            role: h.role === 'USER' ? 'user' : 'model',
            content: h.content,
        }));
        const reply = await this.chatPort.chat(history, input.message, input.financialContext);
        const userMsgId = (0, uuid_1.v4)();
        const assistantMsgId = (0, uuid_1.v4)();
        await this.prisma.chatMessage.createMany({
            data: [
                {
                    id: userMsgId,
                    sessionId: input.sessionId,
                    role: 'USER',
                    content: input.message,
                },
                {
                    id: assistantMsgId,
                    sessionId: input.sessionId,
                    role: 'ASSISTANT',
                    content: reply,
                },
            ],
        });
        return { messageId: assistantMsgId, reply };
    }
};
exports.SendMessageUseCase = SendMessageUseCase;
exports.SendMessageUseCase = SendMessageUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(i_llm_port_1.CHAT_PORT)),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService])
], SendMessageUseCase);
//# sourceMappingURL=send-message.use-case.js.map