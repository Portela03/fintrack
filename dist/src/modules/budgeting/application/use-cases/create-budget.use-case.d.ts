import { UseCase } from "../../../../shared/application/use-case.interface";
import { BudgetPeriod } from '../../domain/entities/budget.entity';
import { IBudgetRepository } from '../../domain/repositories/i-budget.repository';
export declare class CreateBudgetDto {
    categoryId: string;
    limitAmount: number;
    period: BudgetPeriod;
    startDate: string;
}
export interface CreateBudgetInput extends CreateBudgetDto {
    userId: string;
}
export declare class CreateBudgetUseCase implements UseCase<CreateBudgetInput, {
    id: string;
}> {
    private readonly budgetRepo;
    constructor(budgetRepo: IBudgetRepository);
    execute(input: CreateBudgetInput): Promise<{
        id: string;
    }>;
}
