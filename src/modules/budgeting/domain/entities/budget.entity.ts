import { AggregateRoot } from '@shared/domain';
import { Money } from '../../../financial/domain/value-objects/money.vo';

export type BudgetPeriod = 'MONTHLY' | 'WEEKLY' | 'YEARLY';

interface BudgetProps {
  userId: string;
  categoryId: string;
  limitAmount: Money;
  period: BudgetPeriod;
  startDate: Date;
}

export class Budget extends AggregateRoot<BudgetProps> {
  get userId(): string { return this.props.userId; }
  get categoryId(): string { return this.props.categoryId; }
  get limitAmount(): Money { return this.props.limitAmount; }
  get period(): BudgetPeriod { return this.props.period; }
  get startDate(): Date { return this.props.startDate; }

  static create(props: BudgetProps, id?: string): Budget {
    return new Budget(props, id);
  }

  static reconstitute(props: BudgetProps & { id: string }): Budget {
    return new Budget({ ...props }, props.id);
  }
}
