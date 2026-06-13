import { BankAccount } from '../entities/bank-account.entity';

export interface IBankAccountRepository {
  findById(id: string): Promise<BankAccount | null>;
  findByPluggyId(pluggyAccountId: string): Promise<BankAccount | null>;
  findAllByConnectionId(connectionId: string): Promise<BankAccount[]>;
  findAllByUserId(userId: string): Promise<BankAccount[]>;
  upsert(account: BankAccount): Promise<BankAccount>;
  upsertMany(accounts: BankAccount[]): Promise<BankAccount[]>;
}

export const BANK_ACCOUNT_REPOSITORY = Symbol('IBankAccountRepository');
