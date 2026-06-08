export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(`Invalid email: ${email}`);
  }
}

export class InvalidPasswordError extends DomainError {
  constructor(reason: string) {
    super(`Invalid password: ${reason}`);
  }
}

export class InvalidMoneyError extends DomainError {
  constructor(amount: number) {
    super(`Invalid money amount: ${amount}`);
  }
}
