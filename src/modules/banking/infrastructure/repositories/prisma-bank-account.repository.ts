import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma.service';
import { IBankAccountRepository } from '../../domain/repositories/i-bank-account.repository';
import { BankAccount } from '../../domain/entities/bank-account.entity';

@Injectable()
export class PrismaBankAccountRepository implements IBankAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(row: {
    id: string;
    userId: string;
    connectionId: string;
    pluggyAccountId: string;
    type: string;
    subtype: string;
    name: string;
    balance: { toNumber(): number } | number;
    currencyCode: string;
  }): BankAccount {
    return BankAccount.reconstitute({
      id: row.id,
      userId: row.userId,
      connectionId: row.connectionId,
      pluggyAccountId: row.pluggyAccountId,
      type: row.type,
      subtype: row.subtype,
      name: row.name,
      balance: typeof row.balance === 'number' ? row.balance : row.balance.toNumber(),
      currencyCode: row.currencyCode,
    });
  }

  async findById(id: string): Promise<BankAccount | null> {
    const row = await this.prisma.bankAccount.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findByPluggyId(pluggyAccountId: string): Promise<BankAccount | null> {
    const row = await this.prisma.bankAccount.findUnique({ where: { pluggyAccountId } });
    return row ? this.toEntity(row) : null;
  }

  async findAllByConnectionId(connectionId: string): Promise<BankAccount[]> {
    const rows = await this.prisma.bankAccount.findMany({ where: { connectionId } });
    return rows.map((r) => this.toEntity(r));
  }

  async findAllByUserId(userId: string): Promise<BankAccount[]> {
    const rows = await this.prisma.bankAccount.findMany({ where: { userId } });
    return rows.map((r) => this.toEntity(r));
  }

  async upsert(account: BankAccount): Promise<BankAccount> {
    const row = await this.prisma.bankAccount.upsert({
      where: { pluggyAccountId: account.pluggyAccountId },
      create: {
        id: account.id,
        userId: account.userId,
        connectionId: account.connectionId,
        pluggyAccountId: account.pluggyAccountId,
        type: account.type,
        subtype: account.subtype,
        name: account.name,
        balance: account.balance,
        currencyCode: account.currencyCode,
      },
      update: {
        name: account.name,
        balance: account.balance,
        type: account.type,
        subtype: account.subtype,
      },
    });
    return this.toEntity(row);
  }

  async upsertMany(accounts: BankAccount[]): Promise<BankAccount[]> {
    return Promise.all(accounts.map((a) => this.upsert(a)));
  }
}
