import { ValueObject } from '@shared/domain';
import { Either, left, right } from '@shared/domain';
import { InvalidEmailError } from '@shared/domain';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  get value(): string {
    return this.props.value;
  }

  static create(email: string): Either<InvalidEmailError, Email> {
    const normalized = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      return left(new InvalidEmailError(email));
    }
    return right(new Email({ value: normalized }));
  }
}
