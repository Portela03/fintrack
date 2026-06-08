import { AggregateRoot } from "../../../../shared/domain";
import { Money } from '../../../financial/domain/value-objects/money.vo';
export type BudgetPeriod = 'MONTHLY' | 'WEEKLY' | 'YEARLY';
interface BudgetProps {
    userId: string;
    categoryId: string;
    limitAmount: Money;
    period: BudgetPeriod;
    startDate: Date;
}
export declare class Budget extends AggregateRoot<BudgetProps> {
    get userId(): string;
    get categoryId(): string;
    get limitAmount(): Money;
    get period(): BudgetPeriod;
    get startDate(): Date;
    static create(props: BudgetProps, id?: string): Budget;
    static reconstitute(props: BudgetProps & {
        id: string;
    }): Budget;
}
export {};
