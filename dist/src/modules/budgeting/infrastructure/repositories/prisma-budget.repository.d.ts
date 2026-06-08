import { PrismaService } from "../../../../shared/infrastructure/prisma.service";
import { IBudgetRepository } from '../../domain/repositories/i-budget.repository';
import { Budget } from '../../domain/entities/budget.entity';
export declare class PrismaBudgetRepository implements IBudgetRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<Budget | null>;
    findAllByUserId(userId: string): Promise<Budget[]>;
    save(budget: Budget): Promise<void>;
    delete(id: string): Promise<void>;
    private toEntity;
}
