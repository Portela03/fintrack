import { AggregateRoot } from '@shared/domain';
import { Money } from '../../../financial/domain/value-objects/money.vo';

export type GoalType = 'EMERGENCY_FUND' | 'TRAVEL' | 'PROPERTY' | 'VEHICLE' | 'OTHER';

interface GoalProps {
  userId: string;
  name: string;
  type: GoalType;
  targetAmount: Money;
  currentAmount: Money;
  deadline: Date | null;
}

export class Goal extends AggregateRoot<GoalProps> {
  get userId(): string { return this.props.userId; }
  get name(): string { return this.props.name; }
  get type(): GoalType { return this.props.type; }
  get targetAmount(): Money { return this.props.targetAmount; }
  get currentAmount(): Money { return this.props.currentAmount; }
  get deadline(): Date | null { return this.props.deadline; }

  get progressPercentage(): number {
    if (this.props.targetAmount.amount === 0) return 0;
    return Math.min(
      (this.props.currentAmount.amount / this.props.targetAmount.amount) * 100,
      100,
    );
  }

  addProgress(amount: Money): void {
    this.props = {
      ...this.props,
      currentAmount: this.props.currentAmount.add(amount),
    };
  }

  static create(props: GoalProps, id?: string): Goal {
    return new Goal(props, id);
  }

  static reconstitute(props: GoalProps & { id: string }): Goal {
    return new Goal({ ...props }, props.id);
  }
}
