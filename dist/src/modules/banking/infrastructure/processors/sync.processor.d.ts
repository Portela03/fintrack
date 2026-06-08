import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
interface SyncJobData {
    connectionId: string;
    itemId: string;
    userId: string;
}
export declare class SyncProcessor extends WorkerHost {
    private readonly logger;
    process(job: Job<SyncJobData>): Promise<void>;
    private handleSyncAccounts;
    private handleSyncTransactions;
    private handleSyncInvestments;
}
export {};
