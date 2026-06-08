export declare abstract class DomainEvent {
    readonly occurredOn: Date;
    readonly eventName: string;
    constructor(eventName: string);
}
