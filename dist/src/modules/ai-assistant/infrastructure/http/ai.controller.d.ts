import { TokenPayload } from '../../../identity/application/ports/i-token-generator.port';
import { SendMessageUseCase } from '../../application/use-cases/send-message/send-message.use-case';
import { GenerateInsightsUseCase } from '../../application/use-cases/generate-insights/generate-insights.use-case';
import { PrismaService } from "../../../../shared/infrastructure/prisma.service";
declare class SendMessageDto {
    message: string;
}
export declare class AiController {
    private readonly sendMessage;
    private readonly generateInsights;
    private readonly prisma;
    constructor(sendMessage: SendMessageUseCase, generateInsights: GenerateInsightsUseCase, prisma: PrismaService);
    createSession(user: TokenPayload): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        userId: string;
    }>;
    listSessions(user: TokenPayload): Promise<{
        id: string;
        createdAt: Date;
        title: string;
    }[]>;
    chat(sessionId: string, dto: SendMessageDto, user: TokenPayload): Promise<import("../../application/use-cases/send-message/send-message.use-case").SendMessageOutput>;
    getHistory(sessionId: string): Promise<{
        role: string;
        id: string;
        createdAt: Date;
        content: string;
    }[]>;
    insights(user: TokenPayload): Promise<{
        insights: string;
    }>;
}
export {};
