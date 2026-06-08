import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  ITransactionRepository,
  TRANSACTION_REPOSITORY,
} from '../../../domain/repositories/i-transaction.repository';
import dayjs from 'dayjs';

export interface SpendingByCategory {
  categoryId: string | null;
  total: number;
  count: number;
}

export interface GetSpendingReportInput {
  userId: string;
  from: Date;
  to: Date;
}

export interface GetSpendingReportOutput {
  totalDebit: number;
  totalCredit: number;
  byCategory: SpendingByCategory[];
  period: { from: string; to: string };
}

@Injectable()
export class GetSpendingReportUseCase
  implements UseCase<GetSpendingReportInput, GetSpendingReportOutput>
{
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepo: ITransactionRepository,
  ) {}

  async execute(input: GetSpendingReportInput): Promise<GetSpendingReportOutput> {
    const { data } = await this.transactionRepo.findMany({
      userId: input.userId,
      from: input.from,
      to: input.to,
      limit: 10000,
    });

    let totalDebit = 0;
    let totalCredit = 0;
    const categoryMap = new Map<string, SpendingByCategory>();

    for (const tx of data) {
      const amt = tx.amount.amount;
      if (tx.type === 'DEBIT') {
        totalDebit += amt;
      } else {
        totalCredit += amt;
      }

      if (tx.type === 'DEBIT') {
        const key = tx.categoryId ?? 'uncategorized';
        const entry = categoryMap.get(key) ?? {
          categoryId: tx.categoryId,
          total: 0,
          count: 0,
        };
        entry.total += amt;
        entry.count += 1;
        categoryMap.set(key, entry);
      }
    }

    return {
      totalDebit,
      totalCredit,
      byCategory: Array.from(categoryMap.values()).sort(
        (a, b) => b.total - a.total,
      ),
      period: {
        from: dayjs(input.from).format('YYYY-MM-DD'),
        to: dayjs(input.to).format('YYYY-MM-DD'),
      },
    };
  }
}
