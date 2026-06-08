import { AggregateRoot } from "../../../../shared/domain";
interface PluggyConnectionProps {
    userId: string;
    itemId: string;
    status: string;
    lastSyncAt: Date | null;
    createdAt: Date;
}
export declare class PluggyConnection extends AggregateRoot<PluggyConnectionProps> {
    get userId(): string;
    get itemId(): string;
    get status(): string;
    get lastSyncAt(): Date | null;
    get createdAt(): Date;
    markSynced(): void;
    markError(): void;
    static create(props: {
        userId: string;
        itemId: string;
    }): PluggyConnection;
    static reconstitute(props: PluggyConnectionProps & {
        id: string;
    }): PluggyConnection;
}
export {};
