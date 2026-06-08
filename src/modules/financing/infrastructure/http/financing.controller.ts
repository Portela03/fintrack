import {
  Controller, Post, Get, Body, Param, UseGuards, Query,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation,
  ApiCreatedResponse, ApiOkResponse, ApiParam, ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../identity/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../identity/infrastructure/decorators/current-user.decorator';
import { TokenPayload } from '../../../identity/application/ports/i-token-generator.port';
import {
  CreateFinancingSimulationUseCase,
  CreateSimulationDto,
} from '../../application/use-cases/create-financing-simulation.use-case';
import { CompareFinancingOptionsUseCase } from '../../application/use-cases/compare-financing-options.use-case';
import { PrismaService } from '@shared/infrastructure/prisma.service';

class CompareDto {
  @ApiProperty({ description: 'Valor total do financiamento (sem entrada)', example: 300000 })
  @IsNumber() loanAmount!: number;
  @ApiProperty({ description: 'Taxa de juros mensal em decimal (ex: 0.8 para 0,8% a.m.)', example: 0.8 })
  @IsNumber() monthlyRate!: number;
  @ApiProperty({ description: 'Prazo em meses', example: 360 })
  @IsNumber() months!: number;
}

@ApiTags('6. Financing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@Controller('financing')
export class FinancingController {
  constructor(
    private readonly createSimulation: CreateFinancingSimulationUseCase,
    private readonly compareOptions: CompareFinancingOptionsUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Post('simulations')
  @ApiOperation({
    summary: 'Criar simulação de financiamento',
    description: 'Simula um financiamento imobiliário usando tabela SAC ou PRICE. Persiste a simulação e todas as parcelas no banco. SAC: parcela decrescente, juros altos no início. PRICE: parcela fixa, mais juros no total.',
  })
  @ApiCreatedResponse({ description: 'Simulação criada. Retorna `id` e resumo financeiro (total pago, total de juros).' })
  async create(@Body() dto: CreateSimulationDto, @CurrentUser() user: TokenPayload) {
    return this.createSimulation.execute({ ...dto, userId: user.sub });
  }

  @Get('simulations')
  @ApiOperation({
    summary: 'Listar simulações',
    description: 'Retorna todas as simulações de financiamento do usuário, ordenadas por data de criação (mais recente primeiro).',
  })
  @ApiOkResponse({ description: 'Lista de simulações com metadados.' })
  async list(@CurrentUser() user: TokenPayload) {
    return this.prisma.financingSimulation.findMany({
      where: { userId: user.sub },
      select: {
        id: true, name: true, propertyValue: true, downPayment: true,
        loanMonths: true, monthlyRate: true, amortizationType: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('simulations/:id/installments')
  @ApiOperation({
    summary: 'Ver parcelas de uma simulação',
    description: 'Retorna todas as parcelas de uma simulação, ordenadas por mês. Cada parcela contém: `month`, `totalPayment`, `principal`, `interest`, `remainingBalance`.',
  })
  @ApiParam({ name: 'id', description: 'ID da simulação' })
  @ApiOkResponse({ description: 'Lista de parcelas ordenadas por mês.' })
  async getInstallments(@Param('id') id: string) {
    return this.prisma.financingInstallment.findMany({
      where: { simulationId: id },
      orderBy: { month: 'asc' },
    });
  }

  @Post('compare')
  @ApiOperation({
    summary: 'Comparar SAC vs PRICE',
    description: 'Compara os dois sistemas de amortização para os mesmos parâmetros, sem persistir no banco. Retorna totais pagos, total de juros e uma recomendação baseada no custo total.',
  })
  @ApiOkResponse({ description: 'Comparativo com recomendação entre SAC e PRICE.' })
  async compare(@Body() dto: CompareDto) {
    return this.compareOptions.execute(dto);
  }
}
