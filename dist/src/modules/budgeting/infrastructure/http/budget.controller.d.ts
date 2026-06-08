import { TokenPayload } from '../../../identity/application/ports/i-token-generator.port';
import { CreateBudgetUseCase, CreateBudgetDto } from '../../application/use-cases/create-budget.use-case';
import { IBudgetRepository } from '../../domain/repositories/i-budget.repository';
export declare class BudgetController {
    private readonly createBudget;
    private readonly budgetRepo;
    constructor(createBudget: CreateBudgetUseCase, budgetRepo: IBudgetRepository);
    create(dto: CreateBudgetDto, user: TokenPayload): Promise<{
        id: string;
    }>;
    list(user: TokenPayload): Promise<import("../../domain/entities/budget.entity").Budget[]>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
