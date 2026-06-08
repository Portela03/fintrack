import { Goal } from '../entities/goal.entity';
export interface IGoalRepository {
    findById(id: string): Promise<Goal | null>;
    findAllByUserId(userId: string): Promise<Goal[]>;
    save(goal: Goal): Promise<void>;
    update(goal: Goal): Promise<void>;
    delete(id: string): Promise<void>;
}
export declare const GOAL_REPOSITORY: unique symbol;
