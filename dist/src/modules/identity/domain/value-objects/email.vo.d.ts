import { ValueObject } from "../../../../shared/domain";
import { Either } from "../../../../shared/domain";
import { InvalidEmailError } from "../../../../shared/domain";
interface EmailProps {
    value: string;
}
export declare class Email extends ValueObject<EmailProps> {
    get value(): string;
    static create(email: string): Either<InvalidEmailError, Email>;
}
export {};
