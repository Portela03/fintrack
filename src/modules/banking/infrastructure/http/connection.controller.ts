import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../identity/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../identity/infrastructure/decorators/current-user.decorator';
import { TokenPayload } from '../../../identity/application/ports/i-token-generator.port';
import { CreateConnectionUseCase } from '../../application/use-cases/create-connection/create-connection.use-case';
import { HandleWebhookUseCase } from '../../application/use-cases/handle-webhook/handle-webhook.use-case';

class CreateConnectionDto {
  @ApiProperty({ description: 'ID do item retornado pelo widget do Pluggy', example: 'abc123' })
  @IsString()
  itemId!: string;
}

class WebhookPayloadDto {
  @ApiProperty({ example: 'item/updated' })
  event!: string;
  @ApiProperty({ example: 'abc123' })
  itemId!: string;
}

@ApiTags('2. Banking (Pluggy)')
@Controller('connections')
export class ConnectionController {
  constructor(
    private readonly createConnection: CreateConnectionUseCase,
    private readonly handleWebhook: HandleWebhookUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Criar conexão bancária',
    description: 'Registra uma conexão com uma instituição financeira via Pluggy (Open Finance). Após criar a conexão, dispara uma sincronização assíncrona de contas e transações via fila BullMQ. O `itemId` é obtido após o usuário autorizar o acesso pelo widget do Pluggy.',
  })
  @ApiBody({ type: CreateConnectionDto })
  @ApiCreatedResponse({ description: 'Conexão criada. Sincronização iniciada em background.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  async create(
    @Body() dto: CreateConnectionDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.createConnection.execute({
      userId: user.sub,
      itemId: dto.itemId,
    });
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Receber eventos do Pluggy (webhook)',
    description: 'Endpoint chamado automaticamente pelo Pluggy quando dados bancários são atualizados. No evento `item/updated`, dispara re-sincronização de transações. Não requer autenticação JWT (autenticado via assinatura HMAC do Pluggy).',
  })
  @ApiBody({ type: WebhookPayloadDto })
  @ApiOkResponse({ description: 'Evento recebido. Retorna `{ received: true }`.' })
  async webhook(@Body() payload: WebhookPayloadDto) {
    await this.handleWebhook.execute({
      event: payload.event,
      itemId: payload.itemId,
    });
    return { received: true };
  }
}
