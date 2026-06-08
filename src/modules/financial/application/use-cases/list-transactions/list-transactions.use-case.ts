import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  ITransactionRepository,
  TRANSACTION_REPOSITORY,
  TransactionFilter,
} from '../../../domain/repositories/i-transaction.repository';
import { Transaction } from '../../../domain/entities/transaction.entity';

export interface ListTransactionsOutput {
  data: {
    id: string;
    amount: number;
    currency: string;
    type: string;
    date: Date;
    description: string;
    categoryId: string | null;
    status: string;
  }[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ListTransactionsUseCase
  implements UseCase<TransactionFilter, ListTransactionsOutput>
{
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepo: ITransactionRepository,
  ) {}

  async execute(filter: TransactionFilter): Promise<ListTransactionsOutput> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const { data, total } = await this.transactionRepo.findMany({
      ...filter,
      page,
      limit,
    });

    return {
      data: data.map(this.toDto),
      total,
      page,
      limit,
    };
  }

  private toDto(t: Transaction) {
    return {
      id: t.id,
      amount: t.amount.amount,
      currency: t.amount.currency,
      type: t.type,
      date: t.date,
      description: t.description,
      categoryId: t.categoryId,
      status: t.status,
    };
  }
}
