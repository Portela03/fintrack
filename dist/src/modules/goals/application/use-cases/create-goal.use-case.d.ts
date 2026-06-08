import { UseCase } from "../../../../shared/application/use-case.interface";
import { GoalType } from '../../domain/entities/goal.entity';
import { IGoalRepository } from '../../domain/repositories/i-goal.repository';
export declare class CreateGoalDto {
    name: string;
    type: GoalType;
    targetAmount: number;
    deadline?: string;
}
export interface CreateGoalInput extends CreateGoalDto {
    userId: string;
}
export interface GoalWithProgress {
    id: string;
    name: string;
    type: string;
    targetAmount: number;
    currentAmount: number;
    progressPercentage: number;
    deadline: Date | null;
    monthlySavingNeeded: number | null;
}
export declare class CreateGoalUseCase implements UseCase<CreateGoalInput, {
    id: string;
}> {
    private readonly goalRepo;
    constructor(goalRepo: IGoalRepository);
    execute(input: CreateGoalInput): Promise<{
        id: string;
    }>;
}
