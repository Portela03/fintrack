import { TokenPayload } from '../../../identity/application/ports/i-token-generator.port';
import { ListTransactionsUseCase } from '../../application/use-cases/list-transactions/list-transactions.use-case';
import { GetSpendingReportUseCase } from '../../application/use-cases/get-spending-report/get-spending-report.use-case';
export declare class TransactionController {
    private readonly listTransactions;
    private readonly getSpendingReport;
    constructor(listTransactions: ListTransactionsUseCase, getSpendingReport: GetSpendingReportUseCase);
    list(user: TokenPayload, page: number, limit: number, from?: string, to?: string): Promise<import("../../application/use-cases/list-transactions/list-transactions.use-case").ListTransactionsOutput>;
    report(user: TokenPayload, from: string, to: string): Promise<import("../../application/use-cases/get-spending-report/get-spending-report.use-case").GetSpendingReportOutput>;
}
