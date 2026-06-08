import { UseCase } from "../../../../../shared/application/use-case.interface";
import { ITransactionRepository } from '../../../domain/repositories/i-transaction.repository';
export interface SpendingByCategory {
    categoryId: string | null;
    total: number;
    count: number;
}
export interface GetSpendingReportInput {
    userId: string;
    from: Date;
    to: Date;
}
export interface GetSpendingReportOutput {
    totalDebit: number;
    totalCredit: number;
    byCategory: SpendingByCategory[];
    period: {
        from: string;
        to: string;
    };
}
export declare class GetSpendingReportUseCase implements UseCase<GetSpendingReportInput, GetSpendingReportOutput> {
    private readonly transactionRepo;
    constructor(transactionRepo: ITransactionRepository);
    execute(input: GetSpendingReportInput): Promise<GetSpendingReportOutput>;
}
