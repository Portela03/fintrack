import { Module } from '@nestjs/common';
import { BUDGET_REPOSITORY } from '../domain/repositories/i-budget.repository';
import { PrismaBudgetRepository } from './repositories/prisma-budget.repository';
import { BudgetController } from './http/budget.controller';
import { CreateBudgetUseCase } from '../application/use-cases/create-budget.use-case';

@Module({
  controllers: [BudgetController],
  providers: [
    { provide: BUDGET_REPOSITORY, useClass: PrismaBudgetRepository },
    CreateBudgetUseCase,
  ],
})
export class BudgetingModule {}
