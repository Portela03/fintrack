import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { IsString } from 'class-validator';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiProperty,
  ApiCreatedResponse, ApiOkResponse, ApiParam, ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../identity/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../identity/infrastructure/decorators/current-user.decorator';
import { TokenPayload } from '../../../identity/application/ports/i-token-generator.port';
import { SendMessageUseCase } from '../../application/use-cases/send-message/send-message.use-case';
import { GenerateInsightsUseCase } from '../../application/use-cases/generate-insights/generate-insights.use-case';
import { PrismaService } from '@shared/infrastructure/prisma.service';
import { v4 as uuidv4 } from 'uuid';

class SendMessageDto {
  @ApiProperty({ description: 'Mensagem para o assistente financeiro', example: 'Quanto gastei em alimentação esse mês?' })
  @IsString() message!: string;
}

@ApiTags('7. AI Assistant')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@Controller('ai')
export class AiController {
  constructor(
    private readonly sendMessage: SendMessageUseCase,
    private readonly generateInsights: GenerateInsightsUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Post('sessions')
  @ApiOperation({
    summary: 'Criar sessão de chat',
    description: 'Inicia uma nova conversa com o assistente financeiro IA (Gemini 2.0 Flash). Cada sessão mantém histórico de mensagens independente.',
  })
  @ApiCreatedResponse({ description: 'Sessão criada. Retorna `id`, `userId`, `title`, `createdAt`.' })
  async createSession(@CurrentUser() user: TokenPayload) {
    const session = await this.prisma.chatSession.create({
      data: { id: uuidv4(), userId: user.sub, title: 'Nova conversa' },
    });
    return session;
  }

  @Get('sessions')
  @ApiOperation({
    summary: 'Listar sessões de chat',
    description: 'Retorna todas as sessões de conversa do usuário, ordenadas da mais recente para a mais antiga.',
  })
  @ApiOkResponse({ description: 'Lista de sessões com `id`, `title`, `createdAt`.' })
  async listSessions(@CurrentUser() user: TokenPayload) {
    return this.prisma.chatSession.findMany({
      where: { userId: user.sub },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, createdAt: true },
    });
  }

  @Post('sessions/:sessionId/messages')
  @ApiOperation({
    summary: 'Enviar mensagem ao assistente',
    description: 'Envia uma mensagem de texto ao assistente financeiro IA. O assistente tem contexto das últimas 20 mensagens da sessão. Pode responder perguntas sobre gastos, orçamentos, metas, financiamentos e dar conselhos financeiros em português.',
  })
  @ApiParam({ name: 'sessionId', description: 'ID da sessão de chat' })
  @ApiCreatedResponse({ description: 'Resposta do assistente. Retorna `{ userMessage, assistantMessage }`.' })
  async chat(
    @Param('sessionId') sessionId: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.sendMessage.execute({
      userId: user.sub,
      sessionId,
      message: dto.message,
    });
  }

  @Get('sessions/:sessionId/messages')
  @ApiOperation({
    summary: 'Histórico de mensagens',
    description: 'Retorna todas as mensagens de uma sessão de chat, em ordem cronológica. Cada mensagem tem `role` (user | model) e `content`.',
  })
  @ApiParam({ name: 'sessionId', description: 'ID da sessão de chat' })
  @ApiOkResponse({ description: 'Lista de mensagens com `id`, `role`, `content`, `createdAt`.' })
  async getHistory(@Param('sessionId') sessionId: string) {
    return this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, role: true, content: true, createdAt: true },
    });
  }

  @Get('insights')
  @ApiOperation({
    summary: 'Gerar insights financeiros com IA',
    description: 'Analisa as transações do mês atual, agrupa por categoria e envia para o Gemini 2.0 Flash gerar um relatório com insights, padrões de gastos identificados e recomendações personalizadas em português.',
  })
  @ApiOkResponse({ description: 'Relatório de insights gerado pela IA em texto.' })
  async insights(@CurrentUser() user: TokenPayload) {
    return this.generateInsights.execute({ userId: user.sub });
  }
}
