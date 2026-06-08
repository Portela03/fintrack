import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma.service';
import { ITransactionRepository, TransactionFilter } from '../../domain/repositories/i-transaction.repository';
import { Transaction } from '../../domain/entities/transaction.entity';
import { Money } from '../../domain/value-objects/money.vo';

@Injectable()
export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Transaction | null> {
    const row = await this.prisma.transaction.findUnique({ where: { id } });
    if (!row) return null;
    return this.toEntity(row);
  }

  async findByPluggyId(pluggyId: string): Promise<Transaction | null> {
    const row = await this.prisma.transaction.findUnique({
      where: { pluggyTransactionId: pluggyId },
    });
    if (!row) return null;
    return this.toEntity(row);
  }

  async findMany(filter: TransactionFilter): Promise<{ data: Transaction[]; total: number }> {
    const where: Record<string, unknown> = { userId: filter.userId };
    if (filter.accountId) where['accountId'] = filter.accountId;
    if (filter.categoryId) where['categoryId'] = filter.categoryId;
    if (filter.type) where['type'] = filter.type;
    if (filter.from || filter.to) {
      where['date'] = {};
      if (filter.from) (where['date'] as Record<string, unknown>)['gte'] = filter.from;
      if (filter.to) (where['date'] as Record<string, unknown>)['lte'] = filter.to;
    }

    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;

    const [rows, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return { data: rows.map((r) => this.toEntity(r)), total };
  }

  async save(transaction: Transaction): Promise<void> {
    await this.prisma.transaction.create({
      data: {
        id: transaction.id,
        userId: transaction.userId,
        accountId: transaction.accountId,
        pluggyTransactionId: transaction.pluggyTransactionId,
        amount: transaction.amount.amount,
        type: transaction.type,
        date: transaction.date,
        description: transaction.description,
        categoryId: transaction.categoryId,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        currencyCode: transaction.amount.currency,
      },
    });
  }

  async saveMany(transactions: Transaction[]): Promise<void> {
    await this.prisma.transaction.createMany({
      data: transactions.map((t) => ({
        id: t.id,
        userId: t.userId,
        accountId: t.accountId,
        pluggyTransactionId: t.pluggyTransactionId,
        amount: t.amount.amount,
        type: t.type,
        date: t.date,
        description: t.description,
        categoryId: t.categoryId,
        status: t.status,
        paymentMethod: t.paymentMethod,
        currencyCode: t.amount.currency,
      })),
      skipDuplicates: true,
    });
  }

  async update(transaction: Transaction): Promise<void> {
    await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: { categoryId: transaction.categoryId },
    });
  }

  private toEntity(row: {
    id: string; userId: string; accountId: string;
    pluggyTransactionId: string; amount: { toNumber(): number } | number;
    type: string; date: Date; description: string;
    categoryId: string | null; status: string;
    paymentMethod: string | null; currencyCode: string;
  }): Transaction {
    const amount = typeof row.amount === 'object' && 'toNumber' in row.amount
      ? row.amount.toNumber()
      : Number(row.amount);

    return Transaction.reconstitute({
      id: row.id,
      userId: row.userId,
      accountId: row.accountId,
      pluggyTransactionId: row.pluggyTransactionId,
      amount: Money.of(amount, row.currencyCode),
      type: row.type as 'DEBIT' | 'CREDIT',
      date: row.date,
      description: row.description,
      categoryId: row.categoryId,
      status: row.status as 'POSTED' | 'PENDING',
      paymentMethod: row.paymentMethod,
    });
  }
}
