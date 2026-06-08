import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../identity/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../identity/infrastructure/decorators/current-user.decorator';
import { TokenPayload } from '../../../identity/application/ports/i-token-generator.port';
import { ListTransactionsUseCase } from '../../application/use-cases/list-transactions/list-transactions.use-case';
import { GetSpendingReportUseCase } from '../../application/use-cases/get-spending-report/get-spending-report.use-case';

@ApiTags('3. Financial')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly listTransactions: ListTransactionsUseCase,
    private readonly getSpendingReport: GetSpendingReportUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar transações',
    description: 'Retorna as transações do usuário com paginação e filtros de data. As transações são sincronizadas automaticamente pelo Pluggy quando a conexão bancária é atualizada.',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número da página (padrão: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Itens por página (padrão: 20)', example: 20 })
  @ApiQuery({ name: 'from', required: false, description: 'Data inicial (ISO 8601)', example: '2026-01-01' })
  @ApiQuery({ name: 'to', required: false, description: 'Data final (ISO 8601)', example: '2026-12-31' })
  @ApiOkResponse({ description: 'Lista paginada de transações.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  async list(
    @CurrentUser() user: TokenPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.listTransactions.execute({
      userId: user.sub,
      page,
      limit,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Get('report')
  @ApiOperation({
    summary: 'Relatório de gastos por categoria',
    description: 'Agrupa as transações por categoria e retorna totais de receitas e despesas. Padrão: mês atual. Ideal para construir gráficos de pizza ou barras no frontend.',
  })
  @ApiQuery({ name: 'from', required: false, description: 'Data inicial (padrão: primeiro dia do mês atual)', example: '2026-06-01' })
  @ApiQuery({ name: 'to', required: false, description: 'Data final (padrão: hoje)', example: '2026-06-30' })
  @ApiOkResponse({ description: 'Relatório com totais por categoria.' })
  async report(
    @CurrentUser() user: TokenPayload,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const now = new Date();
    return this.getSpendingReport.execute({
      userId: user.sub,
      from: from ? new Date(from) : new Date(now.getFullYear(), now.getMonth(), 1),
      to: to ? new Date(to) : now,
    });
  }
}
