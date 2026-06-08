import { Queue } from 'bullmq';
import { UseCase } from "../../../../../shared/application/use-case.interface";
import { IConnectionRepository } from '../../../domain/repositories/i-connection.repository';
export interface HandleWebhookInput {
    event: string;
    itemId: string;
}
export declare class HandleWebhookUseCase implements UseCase<HandleWebhookInput, void> {
    private readonly connectionRepo;
    private readonly syncQueue;
    private readonly logger;
    constructor(connectionRepo: IConnectionRepository, syncQueue: Queue);
    execute(input: HandleWebhookInput): Promise<void>;
}
