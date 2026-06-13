import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  IPluggyDataPort,
  PLUGGY_DATA_PORT,
} from '../../application/ports/i-pluggy.port';
import {
  IBankAccountRepository,
  BANK_ACCOUNT_REPOSITORY,
} from '../../domain/repositories/i-bank-account.repository';
import {
  IConnectionRepository,
  CONNECTION_REPOSITORY,
} from '../../domain/repositories/i-connection.repository';
import { BankAccount } from '../../domain/entities/bank-account.entity';
import { QUEUE_NAMES, SYNC_JOBS } from '@shared/infrastructure/queue/queue.constants';

export interface SyncAccountsJobData {
  connectionId: string;
  itemId: string;
  userId: string;
}

@Injectable()
export class SyncAccountsJob {
  private readonly logger = new Logger(SyncAccountsJob.name);

  constructor(
    @Inject(PLUGGY_DATA_PORT)
    private readonly pluggyData: IPluggyDataPort,
    @Inject(BANK_ACCOUNT_REPOSITORY)
    private readonly bankAccountRepo: IBankAccountRepository,
    @Inject(CONNECTION_REPOSITORY)
    private readonly connectionRepo: IConnectionRepository,
    @InjectQueue(QUEUE_NAMES.SYNC)
    private readonly syncQueue: Queue,
  ) {}

  async execute(data: SyncAccountsJobData): Promise<void> {
    this.logger.log(`Syncing accounts for connection ${data.connectionId}`);

    const pluggyAccounts = await this.pluggyData.getAccounts(data.itemId);

    const bankAccounts = pluggyAccounts.map((pa) =>
      BankAccount.create({
        userId: data.userId,
        connectionId: data.connectionId,
        pluggyAccountId: pa.id,
        type: pa.type,
        subtype: pa.subtype,
        name: pa.name,
        balance: pa.balance,
        currencyCode: pa.currencyCode,
      }),
    );

    const savedAccounts = await this.bankAccountRepo.upsertMany(bankAccounts);

    this.logger.log(`Upserted ${savedAccounts.length} accounts`);

    // Enqueue transaction sync per account
    for (const account of savedAccounts) {
      await this.syncQueue.add(SYNC_JOBS.SYNC_TRANSACTIONS, {
        connectionId: data.connectionId,
        accountId: account.id,
        pluggyAccountId: account.pluggyAccountId,
        userId: data.userId,
      });
    }

    // Mark connection as synced
    const connection = await this.connectionRepo.findById(data.connectionId);
    if (connection) {
      connection.markSynced();
      await this.connectionRepo.update(connection);
    }

    // Enqueue investment sync
    await this.syncQueue.add(SYNC_JOBS.SYNC_INVESTMENTS, {
      connectionId: data.connectionId,
      itemId: data.itemId,
      userId: data.userId,
    });
  }
}
