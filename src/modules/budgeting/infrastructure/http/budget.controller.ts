import {
  Controller, Post, Get, Delete, Param, Body, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation,
  ApiCreatedResponse, ApiOkResponse, ApiParam, ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../identity/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../identity/infrastructure/decorators/current-user.decorator';
import { TokenPayload } from '../../../identity/application/ports/i-token-generator.port';
import {
  CreateBudgetUseCase,
  CreateBudgetDto,
} from '../../application/use-cases/create-budget.use-case';
import { Inject } from '@nestjs/common';
import {
  IBudgetRepository,
  BUDGET_REPOSITORY,
} from '../../domain/repositories/i-budget.repository';

@ApiTags('4. Budgeting')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@Controller('budgets')
export class BudgetController {
  constructor(
    private readonly createBudget: CreateBudgetUseCase,
    @Inject(BUDGET_REPOSITORY)
    private readonly budgetRepo: IBudgetRepository,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Criar orçamento por categoria',
    description: 'Define um limite de gastos para uma categoria em um período (mensal, semanal ou anual). Útil para controle de gastos com alimentação, transporte, lazer etc.',
  })
  @ApiCreatedResponse({ description: 'Orçamento criado. Retorna `{ id }`.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  async create(@Body() dto: CreateBudgetDto, @CurrentUser() user: TokenPayload) {
    return this.createBudget.execute({ ...dto, userId: user.sub });
  }

  @Get()
  @ApiOperation({
    summary: 'Listar orçamentos',
    description: 'Retorna todos os orçamentos configurados pelo usuário.',
  })
  @ApiOkResponse({ description: 'Lista de orçamentos.' })
  async list(@CurrentUser() user: TokenPayload) {
    return this.budgetRepo.findAllByUserId(user.sub);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Excluir orçamento',
    description: 'Remove permanentemente um orçamento pelo ID.',
  })
  @ApiParam({ name: 'id', description: 'ID do orçamento' })
  @ApiOkResponse({ description: 'Orçamento excluído. Retorna `{ deleted: true }`.' })
  async remove(@Param('id') id: string) {
    await this.budgetRepo.delete(id);
    return { deleted: true };
  }
}
