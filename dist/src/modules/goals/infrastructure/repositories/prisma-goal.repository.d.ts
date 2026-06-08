import { PrismaService } from "../../../../shared/infrastructure/prisma.service";
import { IGoalRepository } from '../../domain/repositories/i-goal.repository';
import { Goal } from '../../domain/entities/goal.entity';
export declare class PrismaGoalRepository implements IGoalRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<Goal | null>;
    findAllByUserId(userId: string): Promise<Goal[]>;
    save(goal: Goal): Promise<void>;
    update(goal: Goal): Promise<void>;
    delete(id: string): Promise<void>;
    private toEntity;
}
