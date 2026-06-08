import { Injectable } from '@nestjs/common';
import { IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UseCase } from '@shared/application/use-case.interface';
import { AmortizationStrategyFactory } from '../../domain/strategies/amortization-strategy.factory';
import { PrismaService } from '@shared/infrastructure/prisma.service';
import { v4 as uuidv4 } from 'uuid';

export class CreateSimulationDto {
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsNumber() propertyValue!: number;
  @ApiProperty() @IsNumber() downPayment!: number;
  @ApiProperty() @IsNumber() loanMonths!: number;
  @ApiProperty() @IsNumber() monthlyRate!: number;
  @ApiProperty({ enum: ['SAC', 'PRICE'] }) @IsEnum(['SAC', 'PRICE']) amortizationType!: 'SAC' | 'PRICE';
}

export interface CreateSimulationInput extends CreateSimulationDto {
  userId: string;
}

@Injectable()
export class CreateFinancingSimulationUseCase
  implements UseCase<CreateSimulationInput, { id: string; summary: object }>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: CreateSimulationInput): Promise<{ id: string; summary: object }> {
    const loanAmount = input.propertyValue - input.downPayment;
    const strategy = AmortizationStrategyFactory.create(input.amortizationType);
    const installments = strategy.calculate(loanAmount, input.monthlyRate / 100, input.loanMonths);

    const simId = uuidv4();
    const totalPaid = installments.reduce((acc, i) => acc + i.totalPayment, 0);
    const totalInterest = installments.reduce((acc, i) => acc + i.interest, 0);

    await this.prisma.financingSimulation.create({
      data: {
        id: simId,
        userId: input.userId,
        name: input.name,
        propertyValue: input.propertyValue,
        downPayment: input.downPayment,
        loanMonths: input.loanMonths,
        monthlyRate: input.monthlyRate,
        amortizationType: input.amortizationType,
        installments: {
          createMany: {
            data: installments.map((i) => ({
              id: uuidv4(),
              month: i.month,
              principal: i.principal,
              interest: i.interest,
              totalPayment: i.totalPayment,
              remainingBalance: i.remainingBalance,
            })),
          },
        },
      },
    });

    return {
      id: simId,
      summary: {
        loanAmount,
        firstInstallment: installments[0].totalPayment,
        lastInstallment: installments[installments.length - 1].totalPayment,
        totalPaid: Number(totalPaid.toFixed(2)),
        totalInterest: Number(totalInterest.toFixed(2)),
      },
    };
  }
}
