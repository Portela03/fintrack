import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { CONNECTION_REPOSITORY } from '../domain/repositories/i-connection.repository';
import {
  PLUGGY_CONNECTION_PORT,
  PLUGGY_DATA_PORT,
} from '../application/ports/i-pluggy.port';

import { PrismaConnectionRepository } from './repositories/prisma-connection.repository';
import { PluggyAdapter } from './adapters/pluggy.adapter';
import { SyncProcessor } from './processors/sync.processor';
import { ConnectionController } from './http/connection.controller';

import { CreateConnectionUseCase } from '../application/use-cases/create-connection/create-connection.use-case';
import { HandleWebhookUseCase } from '../application/use-cases/handle-webhook/handle-webhook.use-case';
import { QUEUE_NAMES } from '@shared/infrastructure/queue/queue.constants';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_NAMES.SYNC })],
  controllers: [ConnectionController],
  providers: [
    { provide: CONNECTION_REPOSITORY, useClass: PrismaConnectionRepository },
    { provide: PLUGGY_CONNECTION_PORT, useClass: PluggyAdapter },
    { provide: PLUGGY_DATA_PORT, useClass: PluggyAdapter },
    SyncProcessor,
    CreateConnectionUseCase,
    HandleWebhookUseCase,
  ],
  exports: [PLUGGY_DATA_PORT, CONNECTION_REPOSITORY],
})
export class BankingModule {}
