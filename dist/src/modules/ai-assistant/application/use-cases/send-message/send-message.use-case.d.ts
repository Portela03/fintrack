import { UseCase } from "../../../../../shared/application/use-case.interface";
import { PrismaService } from "../../../../../shared/infrastructure/prisma.service";
import { IChatPort } from '../../ports/i-llm.port';
export interface SendMessageInput {
    userId: string;
    sessionId: string;
    message: string;
    financialContext?: string;
}
export interface SendMessageOutput {
    messageId: string;
    reply: string;
}
export declare class SendMessageUseCase implements UseCase<SendMessageInput, SendMessageOutput> {
    private readonly chatPort;
    private readonly prisma;
    constructor(chatPort: IChatPort, prisma: PrismaService);
    execute(input: SendMessageInput): Promise<SendMessageOutput>;
}
