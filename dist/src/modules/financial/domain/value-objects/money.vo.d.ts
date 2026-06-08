import { ValueObject } from "../../../../shared/domain";
import { InvalidMoneyError } from "../../../../shared/domain";
import { Either } from "../../../../shared/domain";
interface MoneyProps {
    amount: number;
    currency: string;
}
export declare class Money extends ValueObject<MoneyProps> {
    get amount(): number;
    get currency(): string;
    static create(amount: number, currency?: string): Either<InvalidMoneyError, Money>;
    static of(amount: number, currency?: string): Money;
    add(other: Money): Money;
    subtract(other: Money): Money;
    isPositive(): boolean;
    format(): string;
}
export {};
