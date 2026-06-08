import { TokenPayload } from '../../../identity/application/ports/i-token-generator.port';
import { CreateGoalUseCase, CreateGoalDto } from '../../application/use-cases/create-goal.use-case';
import { IGoalRepository } from '../../domain/repositories/i-goal.repository';
export declare class GoalController {
    private readonly createGoal;
    private readonly goalRepo;
    constructor(createGoal: CreateGoalUseCase, goalRepo: IGoalRepository);
    create(dto: CreateGoalDto, user: TokenPayload): Promise<{
        id: string;
    }>;
    list(user: TokenPayload): Promise<{
        id: string;
        name: string;
        type: import("../../domain/entities/goal.entity").GoalType;
        targetAmount: number;
        currentAmount: number;
        progressPercentage: number;
        deadline: Date | null;
    }[]>;
}
