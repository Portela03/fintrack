import { UseCase } from "../../../../../shared/application/use-case.interface";
import { ITransactionRepository, TransactionFilter } from '../../../domain/repositories/i-transaction.repository';
export interface ListTransactionsOutput {
    data: {
        id: string;
        amount: number;
        currency: string;
        type: string;
        date: Date;
        description: string;
        categoryId: string | null;
        status: string;
    }[];
    total: number;
    page: number;
    limit: number;
}
export declare class ListTransactionsUseCase implements UseCase<TransactionFilter, ListTransactionsOutput> {
    private readonly transactionRepo;
    constructor(transactionRepo: ITransactionRepository);
    execute(filter: TransactionFilter): Promise<ListTransactionsOutput>;
    private toDto;
}
