import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from './shared/infrastructure/prisma.module';
import { QueueModule } from './shared/infrastructure/queue/queue.module';

import { IdentityModule } from './modules/identity/infrastructure/identity.module';
import { BankingModule } from './modules/banking/infrastructure/banking.module';
import { FinancialModule } from './modules/financial/infrastructure/financial.module';
import { BudgetingModule } from './modules/budgeting/infrastructure/budgeting.module';
import { GoalsModule } from './modules/goals/infrastructure/goals.module';
import { FinancingModule } from './modules/financing/infrastructure/financing.module';
import { AiAssistantModule } from './modules/ai-assistant/infrastructure/ai-assistant.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    PrismaModule,
    QueueModule,
    IdentityModule,
    BankingModule,
    FinancialModule,
    BudgetingModule,
    GoalsModule,
    FinancingModule,
    AiAssistantModule,
  ],
})
export class AppModule {}
