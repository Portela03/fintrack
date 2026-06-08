import { Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UseCase } from '@shared/application/use-case.interface';
import {
  IPluggyConnectionPort,
  PLUGGY_CONNECTION_PORT,
} from '../../ports/i-pluggy.port';
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
  connectToken: string;
  connectionId: string;
}

@Injectable()
export class CreateConnectionUseCase
  implements UseCase<CreateConnectionInput, CreateConnectionOutput>
{
  constructor(
    @Inject(PLUGGY_CONNECTION_PORT)
    private readonly pluggyPort: IPluggyConnectionPort,
    @Inject(CONNECTION_REPOSITORY)
    private readonly connectionRepo: IConnectionRepository,
    @InjectQueue(QUEUE_NAMES.SYNC)
    private readonly syncQueue: Queue,
  ) {}

  async execute(input: CreateConnectionInput): Promise<CreateConnectionOutput> {
    const connectToken = await this.pluggyPort.createConnectToken(input.userId);

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

    return { connectToken, connectionId: connection.id };
  }
}
