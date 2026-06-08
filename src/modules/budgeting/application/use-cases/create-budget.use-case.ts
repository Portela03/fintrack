import { Inject, Injectable } from '@nestjs/common';
import { IsString, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UseCase } from '@shared/application/use-case.interface';
import { Budget, BudgetPeriod } from '../../domain/entities/budget.entity';
import { Money } from '../../../financial/domain/value-objects/money.vo';
import {
  IBudgetRepository,
  BUDGET_REPOSITORY,
} from '../../domain/repositories/i-budget.repository';

export class CreateBudgetDto {
  @ApiProperty() @IsString() categoryId!: string;
  @ApiProperty() @IsNumber() limitAmount!: number;
  @ApiProperty({ enum: ['MONTHLY', 'WEEKLY', 'YEARLY'] })
  @IsEnum(['MONTHLY', 'WEEKLY', 'YEARLY'])
  period!: BudgetPeriod;
  @ApiProperty() @IsDateString() startDate!: string;
}

export interface CreateBudgetInput extends CreateBudgetDto {
  userId: string;
}

@Injectable()
export class CreateBudgetUseCase
  implements UseCase<CreateBudgetInput, { id: string }>
{
  constructor(
    @Inject(BUDGET_REPOSITORY)
    private readonly budgetRepo: IBudgetRepository,
  ) {}

  async execute(input: CreateBudgetInput): Promise<{ id: string }> {
    const moneyOrErr = Money.create(input.limitAmount);
    if (moneyOrErr.isLeft()) throw moneyOrErr.value;

    const budget = Budget.create({
      userId: input.userId,
      categoryId: input.categoryId,
      limitAmount: moneyOrErr.value,
      period: input.period,
      startDate: new Date(input.startDate),
    });

    await this.budgetRepo.save(budget);
    return { id: budget.id };
  }
}
