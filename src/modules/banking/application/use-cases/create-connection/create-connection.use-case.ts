import { Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UseCase } from '@shared/application/use-case.interface';
import {
  IConnectionRepository,
  CONNECTION_REPOSITORY,
} from '../../../domain/repositories/i-connection.repository';
import { PluggyConnection } from '../../../domain/entities/pluggy-connection.entity';
import { QUEUE_NAMES, SYNC_JOBS } from '@shared/infrastructure/queue/queue.constants';

export interface CreateConnectionInput {
  userId: string;
  itemId: string;
}

export interface CreateConnectionOutput {
  connectionId: string;
  status: string;
}

@Injectable()
export class CreateConnectionUseCase
  implements UseCase<CreateConnectionInput, CreateConnectionOutput>
{
  constructor(
    @Inject(CONNECTION_REPOSITORY)
    private readonly connectionRepo: IConnectionRepository,
    @InjectQueue(QUEUE_NAMES.SYNC)
    private readonly syncQueue: Queue,
  ) {}

  async execute(input: CreateConnectionInput): Promise<CreateConnectionOutput> {
    const connection = PluggyConnection.create({
      userId: input.userId,
      itemId: input.itemId,
    });

    await this.connectionRepo.save(connection);

    await this.syncQueue.add(
      SYNC_JOBS.SYNC_ACCOUNTS,
      { connectionId: connection.id, itemId: input.itemId, userId: input.userId },
      { delay: 2000 },
    );

    return { connectionId: connection.id, status: connection.status };
  }
}
