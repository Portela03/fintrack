import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IPluggyDataPort,
  PLUGGY_DATA_PORT,
} from '../../application/ports/i-pluggy.port';
import { PrismaService } from '@shared/infrastructure/prisma.service';

export interface SyncInvestmentsJobData {
  connectionId: string;
  itemId: string;
  userId: string;
}

@Injectable()
export class SyncInvestmentsJob {
  private readonly logger = new Logger(SyncInvestmentsJob.name);

  constructor(
    @Inject(PLUGGY_DATA_PORT)
    private readonly pluggyData: IPluggyDataPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(data: SyncInvestmentsJobData): Promise<void> {
    this.logger.log(`Syncing investments for item ${data.itemId}`);

    const pluggyInvestments = await this.pluggyData.getInvestments(data.itemId);

    for (const pi of pluggyInvestments) {
      await this.prisma.investment.upsert({
        where: { pluggyInvestmentId: pi.id },
        create: {
          userId: data.userId,
          pluggyInvestmentId: pi.id,
          name: pi.name,
          type: pi.type,
          subtype: pi.subtype ?? null,
          balance: pi.balance,
          amount: pi.amount ?? null,
          amountProfit: pi.amountProfit ?? null,
          annualRate: pi.annualRate ?? null,
          rateType: pi.rateType ?? null,
          dueDate: pi.dueDate ? new Date(pi.dueDate) : null,
          status: pi.status ?? 'ACTIVE',
          currencyCode: pi.currencyCode,
        },
        update: {
          name: pi.name,
          balance: pi.balance,
          amount: pi.amount ?? null,
          amountProfit: pi.amountProfit ?? null,
          annualRate: pi.annualRate ?? null,
          status: pi.status ?? 'ACTIVE',
        },
      });
    }

    this.logger.log(`Upserted ${pluggyInvestments.length} investments`);
  }
}
