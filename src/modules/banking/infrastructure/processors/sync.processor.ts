import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QUEUE_NAMES, SYNC_JOBS } from '@shared/infrastructure/queue/queue.constants';

interface SyncJobData {
  connectionId: string;
  itemId: string;
  userId: string;
}

@Processor(QUEUE_NAMES.SYNC)
@Injectable()
export class SyncProcessor extends WorkerHost {
  private readonly logger = new Logger(SyncProcessor.name);

  async process(job: Job<SyncJobData>): Promise<void> {
    this.logger.log(`Processing job: ${job.name} for item ${job.data.itemId}`);

    switch (job.name) {
      case SYNC_JOBS.SYNC_ACCOUNTS:
        await this.handleSyncAccounts(job.data);
        break;
      case SYNC_JOBS.SYNC_TRANSACTIONS:
        await this.handleSyncTransactions(job.data);
        break;
      case SYNC_JOBS.SYNC_INVESTMENTS:
        await this.handleSyncInvestments(job.data);
        break;
      default:
        this.logger.warn(`Unknown job: ${job.name}`);
    }
  }

  private async handleSyncAccounts(data: SyncJobData): Promise<void> {
    // Injected via module — actual sync logic delegated to financial module use-cases via events
    this.logger.log(`Sync accounts for connection ${data.connectionId}`);
  }

  private async handleSyncTransactions(data: SyncJobData): Promise<void> {
    this.logger.log(`Sync transactions for connection ${data.connectionId}`);
  }

  private async handleSyncInvestments(data: SyncJobData): Promise<void> {
    this.logger.log(`Sync investments for connection ${data.connectionId}`);
  }
}
