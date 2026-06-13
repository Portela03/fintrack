import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QUEUE_NAMES, SYNC_JOBS } from '@shared/infrastructure/queue/queue.constants';
import { SyncAccountsJob, SyncAccountsJobData } from '../jobs/sync-accounts.job';
import { SyncTransactionsJob, SyncTransactionsJobData } from '../jobs/sync-transactions.job';
import { SyncInvestmentsJob, SyncInvestmentsJobData } from '../jobs/sync-investments.job';

@Processor(QUEUE_NAMES.SYNC)
@Injectable()
export class SyncProcessor extends WorkerHost {
  private readonly logger = new Logger(SyncProcessor.name);

  constructor(
    private readonly syncAccountsJob: SyncAccountsJob,
    private readonly syncTransactionsJob: SyncTransactionsJob,
    private readonly syncInvestmentsJob: SyncInvestmentsJob,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing job: ${job.name}`);

    switch (job.name) {
      case SYNC_JOBS.SYNC_ACCOUNTS:
        await this.syncAccountsJob.execute(job.data as SyncAccountsJobData);
        break;
      case SYNC_JOBS.SYNC_TRANSACTIONS:
        await this.syncTransactionsJob.execute(job.data as SyncTransactionsJobData);
        break;
      case SYNC_JOBS.SYNC_INVESTMENTS:
        await this.syncInvestmentsJob.execute(job.data as SyncInvestmentsJobData);
        break;
      default:
        this.logger.warn(`Unknown job: ${job.name}`);
    }
  }
}
