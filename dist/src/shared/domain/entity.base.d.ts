import { DomainEvent } from './domain-event.base';
export declare abstract class Entity<T> {
    protected readonly _id: string;
    protected props: T;
    constructor(props: T, id?: string);
    get id(): string;
    equals(entity?: Entity<T>): boolean;
}
export declare abstract class AggregateRoot<T> extends Entity<T> {
    private _domainEvents;
    get domainEvents(): DomainEvent[];
    protected addDomainEvent(event: DomainEvent): void;
    clearEvents(): void;
}
