import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma.service';
import { IBudgetRepository } from '../../domain/repositories/i-budget.repository';
import { Budget } from '../../domain/entities/budget.entity';
import { Money } from '../../../financial/domain/value-objects/money.vo';

@Injectable()
export class PrismaBudgetRepository implements IBudgetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Budget | null> {
    const row = await this.prisma.budget.findUnique({ where: { id } });
    if (!row) return null;
    return this.toEntity(row);
  }

  async findAllByUserId(userId: string): Promise<Budget[]> {
    const rows = await this.prisma.budget.findMany({ where: { userId } });
    return rows.map((r) => this.toEntity(r));
  }

  async save(budget: Budget): Promise<void> {
    await this.prisma.budget.create({
      data: {
        id: budget.id,
        userId: budget.userId,
        categoryId: budget.categoryId,
        limitAmount: budget.limitAmount.amount,
        period: budget.period,
        startDate: budget.startDate,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.budget.delete({ where: { id } });
  }

  private toEntity(row: {
    id: string; userId: string; categoryId: string;
    limitAmount: { toNumber(): number } | number;
    period: string; startDate: Date;
  }): Budget {
    const amount = typeof row.limitAmount === 'object' && 'toNumber' in row.limitAmount
      ? row.limitAmount.toNumber()
      : Number(row.limitAmount);
    return Budget.reconstitute({
      id: row.id,
      userId: row.userId,
      categoryId: row.categoryId,
      limitAmount: Money.of(amount),
      period: row.period as 'MONTHLY' | 'WEEKLY' | 'YEARLY',
      startDate: row.startDate,
    });
  }
}
