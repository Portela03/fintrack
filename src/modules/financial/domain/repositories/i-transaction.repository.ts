import { Transaction } from '../entities/transaction.entity';

export interface TransactionFilter {
  userId: string;
  accountId?: string;
  categoryId?: string;
  from?: Date;
  to?: Date;
  type?: string;
  page?: number;
  limit?: number;
}

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByPluggyId(pluggyId: string): Promise<Transaction | null>;
  findMany(filter: TransactionFilter): Promise<{ data: Transaction[]; total: number }>;
  save(transaction: Transaction): Promise<void>;
  saveMany(transactions: Transaction[]): Promise<void>;
  update(transaction: Transaction): Promise<void>;
}

export const TRANSACTION_REPOSITORY = Symbol('ITransactionRepository');
