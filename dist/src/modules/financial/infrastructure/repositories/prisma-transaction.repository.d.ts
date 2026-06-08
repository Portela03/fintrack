import { PrismaService } from "../../../../shared/infrastructure/prisma.service";
import { ITransactionRepository, TransactionFilter } from '../../domain/repositories/i-transaction.repository';
import { Transaction } from '../../domain/entities/transaction.entity';
export declare class PrismaTransactionRepository implements ITransactionRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<Transaction | null>;
    findByPluggyId(pluggyId: string): Promise<Transaction | null>;
    findMany(filter: TransactionFilter): Promise<{
        data: Transaction[];
        total: number;
    }>;
    save(transaction: Transaction): Promise<void>;
    saveMany(transactions: Transaction[]): Promise<void>;
    update(transaction: Transaction): Promise<void>;
    private toEntity;
}
