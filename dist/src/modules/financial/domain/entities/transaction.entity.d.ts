import { Entity } from "../../../../shared/domain";
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
export declare class Transaction extends Entity<TransactionProps> {
    get userId(): string;
    get accountId(): string;
    get pluggyTransactionId(): string;
    get amount(): Money;
    get type(): TransactionType;
    get date(): Date;
    get description(): string;
    get categoryId(): string | null;
    get status(): TransactionStatus;
    get paymentMethod(): string | null;
    assignCategory(categoryId: string): void;
    static create(props: Omit<TransactionProps, 'status'> & {
        status?: TransactionStatus;
    }, id?: string): Transaction;
    static reconstitute(props: TransactionProps & {
        id: string;
    }): Transaction;
}
export {};
