import { AggregateRoot } from '@shared/domain';

interface PluggyConnectionProps {
  userId: string;
  itemId: string;
  status: string;
  lastSyncAt: Date | null;
  createdAt: Date;
}

export class PluggyConnection extends AggregateRoot<PluggyConnectionProps> {
  get userId(): string { return this.props.userId; }
  get itemId(): string { return this.props.itemId; }
  get status(): string { return this.props.status; }
  get lastSyncAt(): Date | null { return this.props.lastSyncAt; }
  get createdAt(): Date { return this.props.createdAt; }

  markSynced(): void {
    this.props = { ...this.props, status: 'UPDATED', lastSyncAt: new Date() };
  }

  markError(): void {
    this.props = { ...this.props, status: 'LOGIN_ERROR' };
  }

  static create(props: { userId: string; itemId: string }): PluggyConnection {
    return new PluggyConnection({
      ...props,
      status: 'UPDATING',
      lastSyncAt: null,
      createdAt: new Date(),
    });
  }

  static reconstitute(
    props: PluggyConnectionProps & { id: string },
  ): PluggyConnection {
    return new PluggyConnection(
      {
        userId: props.userId,
        itemId: props.itemId,
        status: props.status,
        lastSyncAt: props.lastSyncAt,
        createdAt: props.createdAt,
      },
      props.id,
    );
  }
}
