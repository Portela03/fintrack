import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UseCase } from '@shared/application/use-case.interface';
import {
  IConnectionRepository,
  CONNECTION_REPOSITORY,
} from '../../../domain/repositories/i-connection.repository';
import { QUEUE_NAMES, SYNC_JOBS } from '@shared/infrastructure/queue/queue.constants';

export interface HandleWebhookInput {
  event: string;
  itemId: string;
}

@Injectable()
export class HandleWebhookUseCase
  implements UseCase<HandleWebhookInput, void>
{
  private readonly logger = new Logger(HandleWebhookUseCase.name);

  constructor(
    @Inject(CONNECTION_REPOSITORY)
    private readonly connectionRepo: IConnectionRepository,
    @InjectQueue(QUEUE_NAMES.SYNC)
    private readonly syncQueue: Queue,
  ) {}

  async execute(input: HandleWebhookInput): Promise<void> {
    const connection = await this.connectionRepo.findByItemId(input.itemId);
    if (!connection) {
      this.logger.warn(`Webhook for unknown itemId: ${input.itemId}`);
      return;
    }

    if (input.event === 'item/updated' || input.event === 'item/created') {
      await this.syncQueue.add(SYNC_JOBS.SYNC_TRANSACTIONS, {
        connectionId: connection.id,
        itemId: input.itemId,
        userId: connection.userId,
      });
    }
  }
}
