import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma.service';
import { IGoalRepository } from '../../domain/repositories/i-goal.repository';
import { Goal } from '../../domain/entities/goal.entity';
import { Money } from '../../../financial/domain/value-objects/money.vo';

@Injectable()
export class PrismaGoalRepository implements IGoalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Goal | null> {
    const row = await this.prisma.goal.findUnique({ where: { id } });
    if (!row) return null;
    return this.toEntity(row);
  }

  async findAllByUserId(userId: string): Promise<Goal[]> {
    const rows = await this.prisma.goal.findMany({ where: { userId } });
    return rows.map((r) => this.toEntity(r));
  }

  async save(goal: Goal): Promise<void> {
    await this.prisma.goal.create({
      data: {
        id: goal.id, userId: goal.userId, name: goal.name, type: goal.type,
        targetAmount: goal.targetAmount.amount,
        currentAmount: goal.currentAmount.amount,
        deadline: goal.deadline,
      },
    });
  }

  async update(goal: Goal): Promise<void> {
    await this.prisma.goal.update({
      where: { id: goal.id },
      data: { currentAmount: goal.currentAmount.amount },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.goal.delete({ where: { id } });
  }

  private toEntity(row: {
    id: string; userId: string; name: string; type: string;
    targetAmount: { toNumber(): number } | number;
    currentAmount: { toNumber(): number } | number;
    deadline: Date | null;
  }): Goal {
    const toNum = (v: { toNumber(): number } | number) =>
      typeof v === 'object' && 'toNumber' in v ? v.toNumber() : Number(v);
    return Goal.reconstitute({
      id: row.id, userId: row.userId, name: row.name,
      type: row.type as Goal['type'],
      targetAmount: Money.of(toNum(row.targetAmount)),
      currentAmount: Money.of(toNum(row.currentAmount)),
      deadline: row.deadline,
    });
  }
}
