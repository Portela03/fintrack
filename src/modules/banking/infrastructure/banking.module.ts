import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { CONNECTION_REPOSITORY } from '../domain/repositories/i-connection.repository';
import { BANK_ACCOUNT_REPOSITORY } from '../domain/repositories/i-bank-account.repository';
import {
  PLUGGY_CONNECTION_PORT,
  PLUGGY_DATA_PORT,
} from '../application/ports/i-pluggy.port';

import { PrismaConnectionRepository } from './repositories/prisma-connection.repository';
import { PrismaBankAccountRepository } from './repositories/prisma-bank-account.repository';
import { PluggyAdapter } from './adapters/pluggy.adapter';
import { SyncProcessor } from './processors/sync.processor';
import { ConnectionController } from './http/connection.controller';
import { PluggyWebhookGuard } from './guards/pluggy-webhook.guard';

import { SyncAccountsJob } from './jobs/sync-accounts.job';
import { SyncTransactionsJob } from './jobs/sync-transactions.job';
import { SyncInvestmentsJob } from './jobs/sync-investments.job';

import { CreateConnectionUseCase } from '../application/use-cases/create-connection/create-connection.use-case';
import { HandleWebhookUseCase } from '../application/use-cases/handle-webhook/handle-webhook.use-case';
import { GetConnectTokenUseCase } from '../application/use-cases/get-connect-token/get-connect-token.use-case';
import { ListConnectionsUseCase } from '../application/use-cases/list-connections/list-connections.use-case';
import { ListAccountsUseCase } from '../application/use-cases/list-accounts/list-accounts.use-case';
import { DeleteConnectionUseCase } from '../application/use-cases/delete-connection/delete-connection.use-case';

import { FinancialModule } from '../../financial/infrastructure/financial.module';
import { QUEUE_NAMES } from '@shared/infrastructure/queue/queue.constants';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_NAMES.SYNC },
      { name: QUEUE_NAMES.AI },
    ),
    FinancialModule,
  ],
  controllers: [ConnectionController],
  providers: [
    { provide: CONNECTION_REPOSITORY, useClass: PrismaConnectionRepository },
    { provide: BANK_ACCOUNT_REPOSITORY, useClass: PrismaBankAccountRepository },
    { provide: PLUGGY_CONNECTION_PORT, useClass: PluggyAdapter },
    { provide: PLUGGY_DATA_PORT, useClass: PluggyAdapter },
    SyncProcessor,
    SyncAccountsJob,
    SyncTransactionsJob,
    SyncInvestmentsJob,
    PluggyWebhookGuard,
    CreateConnectionUseCase,
    HandleWebhookUseCase,
    GetConnectTokenUseCase,
    ListConnectionsUseCase,
    ListAccountsUseCase,
    DeleteConnectionUseCase,
  ],
  exports: [PLUGGY_DATA_PORT, CONNECTION_REPOSITORY, BANK_ACCOUNT_REPOSITORY],
})
export class BankingModule {}
