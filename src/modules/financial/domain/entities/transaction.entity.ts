import { Entity } from '@shared/domain';
import { Money } from '../value-objects/money.vo';

export type TransactionType = 'DEBIT' | 'CREDIT';
export type TransactionStatus = 'POSTED' | 'PENDING';

interface TransactionProps {
  userId: string;
  accountId: string;
  pluggyTransactionId: string;
  amount: Money;
  type: TransactionType;
  date: Date;
  description: string;
  categoryId: string | null;
  status: TransactionStatus;
  paymentMethod: string | null;
}

export class Transaction extends Entity<TransactionProps> {
  get userId(): string { return this.props.userId; }
  get accountId(): string { return this.props.accountId; }
  get pluggyTransactionId(): string { return this.props.pluggyTransactionId; }
  get amount(): Money { return this.props.amount; }
  get type(): TransactionType { return this.props.type; }
  get date(): Date { return this.props.date; }
  get description(): string { return this.props.description; }
  get categoryId(): string | null { return this.props.categoryId; }
  get status(): TransactionStatus { return this.props.status; }
  get paymentMethod(): string | null { return this.props.paymentMethod; }

  assignCategory(categoryId: string): void {
    this.props = { ...this.props, categoryId };
  }

  static create(props: Omit<TransactionProps, 'status'> & { status?: TransactionStatus }, id?: string): Transaction {
    return new Transaction({ ...props, status: props.status ?? 'POSTED' }, id);
  }

  static reconstitute(props: TransactionProps & { id: string }): Transaction {
    return new Transaction({ ...props }, props.id);
  }
}
