import { Entity } from '@shared/domain';

interface BankAccountProps {
  userId: string;
  connectionId: string;
  pluggyAccountId: string;
  type: string;
  subtype: string;
  name: string;
  balance: number;
  currencyCode: string;
}

export class BankAccount extends Entity<BankAccountProps> {
  get userId(): string { return this.props.userId; }
  get connectionId(): string { return this.props.connectionId; }
  get pluggyAccountId(): string { return this.props.pluggyAccountId; }
  get type(): string { return this.props.type; }
  get subtype(): string { return this.props.subtype; }
  get name(): string { return this.props.name; }
  get balance(): number { return this.props.balance; }
  get currencyCode(): string { return this.props.currencyCode; }

  updateBalance(balance: number): void {
    this.props = { ...this.props, balance };
  }

  static create(props: BankAccountProps): BankAccount {
    return new BankAccount(props);
  }

  static reconstitute(props: BankAccountProps & { id: string }): BankAccount {
    return new BankAccount(
      {
        userId: props.userId,
        connectionId: props.connectionId,
        pluggyAccountId: props.pluggyAccountId,
        type: props.type,
        subtype: props.subtype,
        name: props.name,
        balance: Number(props.balance),
        currencyCode: props.currencyCode,
      },
      props.id,
    );
  }
}
