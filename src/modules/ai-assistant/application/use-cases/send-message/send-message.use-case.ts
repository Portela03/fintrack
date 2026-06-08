import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import { PrismaService } from '@shared/infrastructure/prisma.service';
import { IChatPort, CHAT_PORT, ChatMessage } from '../../ports/i-llm.port';
import { v4 as uuidv4 } from 'uuid';

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

@Injectable()
export class SendMessageUseCase
  implements UseCase<SendMessageInput, SendMessageOutput>
{
  constructor(
    @Inject(CHAT_PORT)
    private readonly chatPort: IChatPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: SendMessageInput): Promise<SendMessageOutput> {
    // Load history
    const historyRows = await this.prisma.chatMessage.findMany({
      where: { sessionId: input.sessionId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const history: ChatMessage[] = historyRows.map((h) => ({
      role: h.role === 'USER' ? 'user' : 'model',
      content: h.content,
    }));

    const reply = await this.chatPort.chat(
      history,
      input.message,
      input.financialContext,
    );

    // Persist both messages
    const userMsgId = uuidv4();
    const assistantMsgId = uuidv4();

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
}
