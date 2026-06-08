import { Module } from '@nestjs/common';
import { TRANSACTION_REPOSITORY } from '../domain/repositories/i-transaction.repository';
import { PrismaTransactionRepository } from './repositories/prisma-transaction.repository';
import { TransactionController } from './http/transaction.controller';
import { ListTransactionsUseCase } from '../application/use-cases/list-transactions/list-transactions.use-case';
import { GetSpendingReportUseCase } from '../application/use-cases/get-spending-report/get-spending-report.use-case';

@Module({
  controllers: [TransactionController],
  providers: [
    { provide: TRANSACTION_REPOSITORY, useClass: PrismaTransactionRepository },
    ListTransactionsUseCase,
    GetSpendingReportUseCase,
  ],
  exports: [TRANSACTION_REPOSITORY],
})
export class FinancialModule {}
