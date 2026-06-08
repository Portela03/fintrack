import { ValueObject } from '@shared/domain';
import { InvalidMoneyError } from '@shared/domain';
import { Either, left, right } from '@shared/domain';

interface MoneyProps {
  amount: number;
  currency: string;
}

export class Money extends ValueObject<MoneyProps> {
  get amount(): number { return this.props.amount; }
  get currency(): string { return this.props.currency; }

  static create(amount: number, currency = 'BRL'): Either<InvalidMoneyError, Money> {
    if (!isFinite(amount)) {
      return left(new InvalidMoneyError(amount));
    }
    return right(new Money({ amount: Number(amount.toFixed(2)), currency }));
  }

  static of(amount: number, currency = 'BRL'): Money {
    return new Money({ amount: Number(amount.toFixed(2)), currency });
  }

  add(other: Money): Money {
    return Money.of(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    return Money.of(this.amount - other.amount, this.currency);
  }

  isPositive(): boolean {
    return this.amount > 0;
  }

  format(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount);
  }
}
