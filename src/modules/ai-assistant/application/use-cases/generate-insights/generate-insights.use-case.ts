import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import { PrismaService } from '@shared/infrastructure/prisma.service';
import { IInsightPort, INSIGHT_PORT } from '../../ports/i-llm.port';
import dayjs from 'dayjs';

export interface GenerateInsightsInput {
  userId: string;
}

@Injectable()
export class GenerateInsightsUseCase
  implements UseCase<GenerateInsightsInput, { insights: string }>
{
  constructor(
    @Inject(INSIGHT_PORT)
    private readonly insightPort: IInsightPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: GenerateInsightsInput): Promise<{ insights: string }> {
    const from = dayjs().startOf('month').toDate();
    const to = dayjs().endOf('month').toDate();

    const transactions = await this.prisma.transaction.findMany({
      where: { userId: input.userId, date: { gte: from, lte: to }, type: 'DEBIT' },
      select: { amount: true, description: true, categoryId: true },
    });

    const totalSpent = transactions
      .reduce((acc, t) => acc + Number(t.amount), 0)
      .toFixed(2);

    const categoryGroups = transactions.reduce<Record<string, number>>(
      (acc, t) => {
        const key = t.categoryId ?? 'Sem categoria';
        acc[key] = (acc[key] ?? 0) + Number(t.amount);
        return acc;
      },
      {},
    );

    const summary = `
Período: ${dayjs(from).format('DD/MM/YYYY')} a ${dayjs(to).format('DD/MM/YYYY')}
Total gasto: R$ ${totalSpent}
Número de transações: ${transactions.length}
Gastos por categoria:
${Object.entries(categoryGroups)
  .sort(([, a], [, b]) => b - a)
  .map(([k, v]) => `  - ${k}: R$ ${v.toFixed(2)}`)
  .join('\n')}
`;

    const insights = await this.insightPort.generateInsights(summary);
    return { insights };
  }
}
