import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation,
  ApiCreatedResponse, ApiOkResponse, ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../../../identity/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../identity/infrastructure/decorators/current-user.decorator';
import { TokenPayload } from '../../../identity/application/ports/i-token-generator.port';
import { CreateGoalUseCase, CreateGoalDto } from '../../application/use-cases/create-goal.use-case';
import { IGoalRepository, GOAL_REPOSITORY } from '../../domain/repositories/i-goal.repository';

@ApiTags('5. Goals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@Controller('goals')
export class GoalController {
  constructor(
    private readonly createGoal: CreateGoalUseCase,
    @Inject(GOAL_REPOSITORY)
    private readonly goalRepo: IGoalRepository,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Criar meta financeira',
    description: 'Cria uma meta de economia (reserva de emergência, viagem, imóvel, veículo etc.). O progresso é calculado automaticamente conforme o `currentAmount` avança em relação ao `targetAmount`.',
  })
  @ApiCreatedResponse({ description: 'Meta criada. Retorna `{ id }`.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  async create(@Body() dto: CreateGoalDto, @CurrentUser() user: TokenPayload) {
    return this.createGoal.execute({ ...dto, userId: user.sub });
  }

  @Get()
  @ApiOperation({
    summary: 'Listar metas com progresso',
    description: 'Retorna todas as metas financeiras do usuário, incluindo `progressPercentage` (0–100) e `monthlySavingNeeded` calculados automaticamente.',
  })
  @ApiOkResponse({
    description: 'Lista de metas com `id`, `name`, `type`, `targetAmount`, `currentAmount`, `progressPercentage`, `deadline`.',
  })
  async list(@CurrentUser() user: TokenPayload) {
    const goals = await this.goalRepo.findAllByUserId(user.sub);
    return goals.map((g) => ({
      id: g.id,
      name: g.name,
      type: g.type,
      targetAmount: g.targetAmount.amount,
      currentAmount: g.currentAmount.amount,
      progressPercentage: g.progressPercentage,
      deadline: g.deadline,
    }));
  }
}
