import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
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
  ApiNoContentResponse,
  ApiParam,
} from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../identity/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../identity/infrastructure/decorators/current-user.decorator';
import { TokenPayload } from '../../../identity/application/ports/i-token-generator.port';
import { CreateConnectionUseCase } from '../../application/use-cases/create-connection/create-connection.use-case';
import { HandleWebhookUseCase } from '../../application/use-cases/handle-webhook/handle-webhook.use-case';
import { GetConnectTokenUseCase } from '../../application/use-cases/get-connect-token/get-connect-token.use-case';
import { ListConnectionsUseCase } from '../../application/use-cases/list-connections/list-connections.use-case';
import { ListAccountsUseCase } from '../../application/use-cases/list-accounts/list-accounts.use-case';
import { DeleteConnectionUseCase } from '../../application/use-cases/delete-connection/delete-connection.use-case';
import { PluggyWebhookGuard } from '../guards/pluggy-webhook.guard';

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
    private readonly getConnectToken: GetConnectTokenUseCase,
    private readonly listConnections: ListConnectionsUseCase,
    private readonly listAccounts: ListAccountsUseCase,
    private readonly deleteConnection: DeleteConnectionUseCase,
  ) {}

  @Get('connect-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Obter token para widget do Pluggy',
    description: 'Gera um accessToken temporário para inicializar o widget do Pluggy no frontend. O usuário usa o widget para autorizar acesso à instituição financeira. Após autorização, o widget retorna um `itemId` que deve ser enviado em `POST /connections`.',
  })
  @ApiOkResponse({ description: 'Token gerado com sucesso.' })
  async connectToken(@CurrentUser() user: TokenPayload) {
    return this.getConnectToken.execute({ userId: user.sub });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Registrar conexão bancária',
    description: 'Registra o `itemId` obtido pelo widget do Pluggy. Dispara sincronização assíncrona de contas, transações e investimentos via fila BullMQ.',
  })
  @ApiBody({ type: CreateConnectionDto })
  @ApiCreatedResponse({ description: 'Conexão registrada. Sincronização iniciada em background.' })
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

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Listar conexões bancárias',
    description: 'Retorna todas as conexões bancárias do usuário autenticado com status de sincronização.',
  })
  @ApiOkResponse({ description: 'Lista de conexões.' })
  async list(@CurrentUser() user: TokenPayload) {
    return this.listConnections.execute({ userId: user.sub });
  }

  @Get(':id/accounts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Listar contas de uma conexão',
    description: 'Retorna as contas bancárias sincronizadas de uma conexão específica (verificação de ownership automática).',
  })
  @ApiParam({ name: 'id', description: 'ID da conexão' })
  @ApiOkResponse({ description: 'Lista de contas bancárias com saldos.' })
  async accounts(
    @Param('id') connectionId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.listAccounts.execute({ userId: user.sub, connectionId });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover conexão bancária',
    description: 'Remove a conexão e todos os dados associados (contas, transações) via cascade. Operação irreversível.',
  })
  @ApiParam({ name: 'id', description: 'ID da conexão' })
  @ApiNoContentResponse({ description: 'Conexão removida.' })
  async remove(
    @Param('id') connectionId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.deleteConnection.execute({ userId: user.sub, connectionId });
  }

  @Post('webhook')
  @UseGuards(PluggyWebhookGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Receber eventos do Pluggy (webhook)',
    description: 'Endpoint chamado automaticamente pelo Pluggy quando dados bancários são atualizados. Valida assinatura HMAC-SHA256 via `x-pluggy-signature`. No evento `item/updated`, dispara re-sincronização de transações.',
  })
  @ApiBody({ type: WebhookPayloadDto })
  @ApiOkResponse({ description: 'Evento recebido.' })
  async webhook(@Body() payload: WebhookPayloadDto) {
    await this.handleWebhook.execute({
      event: payload.event,
      itemId: payload.itemId,
    });
    return { received: true };
  }
}
