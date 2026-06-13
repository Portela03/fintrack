import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  IPluggyDataPort,
  PLUGGY_DATA_PORT,
} from '../../application/ports/i-pluggy.port';
import {
  ITransactionRepository,
  TRANSACTION_REPOSITORY,
} from '../../../financial/domain/repositories/i-transaction.repository';
import { Transaction } from '../../../financial/domain/entities/transaction.entity';
import { Money } from '../../../financial/domain/value-objects/money.vo';
import { QUEUE_NAMES, AI_JOBS } from '@shared/infrastructure/queue/queue.constants';

export interface SyncTransactionsJobData {
  connectionId: string;
  accountId: string;
  pluggyAccountId: string;
  userId: string;
  from?: string;
  to?: string;
}

@Injectable()
export class SyncTransactionsJob {
  private readonly logger = new Logger(SyncTransactionsJob.name);

  constructor(
    @Inject(PLUGGY_DATA_PORT)
    private readonly pluggyData: IPluggyDataPort,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepo: ITransactionRepository,
    @InjectQueue(QUEUE_NAMES.AI)
    private readonly aiQueue: Queue,
  ) {}

  async execute(data: SyncTransactionsJobData): Promise<void> {
    this.logger.log(`Syncing transactions for account ${data.accountId}`);

    const from = data.from ? new Date(data.from) : undefined;
    const to = data.to ? new Date(data.to) : undefined;

    const pluggyTxs = await this.pluggyData.getTransactions(
      data.pluggyAccountId,
      from,
      to,
    );

    const transactions: Transaction[] = [];

    for (const pt of pluggyTxs) {
      const moneyResult = Money.create(Math.abs(pt.amount), pt.currencyCode ?? 'BRL');
      if (moneyResult.isLeft()) {
        this.logger.warn(`Invalid amount for pluggy tx ${pt.id}: ${pt.amount}`);
        continue;
      }

      const tx = Transaction.create({
        userId: data.userId,
        accountId: data.accountId,
        pluggyTransactionId: pt.id,
        amount: moneyResult.value,
        type: pt.amount < 0 ? 'DEBIT' : 'CREDIT',
        date: new Date(pt.date),
        description: pt.description,
        categoryId: null,
        status: (pt.status ?? 'POSTED') as 'POSTED' | 'PENDING',
        paymentMethod: pt.paymentData?.paymentMethod ?? null,
      });

      transactions.push(tx);
    }

    if (transactions.length === 0) {
      this.logger.log(`No transactions to sync for account ${data.accountId}`);
      return;
    }

    await this.transactionRepo.saveMany(transactions);
    this.logger.log(`Saved ${transactions.length} transactions for account ${data.accountId}`);

    // Enqueue AI categorization for uncategorized transactions
    const uncategorized = transactions.filter((t) => t.categoryId === null);
    if (uncategorized.length > 0) {
      await this.aiQueue.add(AI_JOBS.CATEGORIZE_TRANSACTION, {
        transactionIds: uncategorized.map((t) => t.id),
        userId: data.userId,
      });
    }
  }
}
