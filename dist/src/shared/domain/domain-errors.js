"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidMoneyError = exports.InvalidPasswordError = exports.InvalidEmailError = exports.DomainError = void 0;
class DomainError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}
exports.DomainError = DomainError;
class InvalidEmailError extends DomainError {
    constructor(email) {
        super(`Invalid email: ${email}`);
    }
}
exports.InvalidEmailError = InvalidEmailError;
class InvalidPasswordError extends DomainError {
    constructor(reason) {
        super(`Invalid password: ${reason}`);
    }
}
exports.InvalidPasswordError = InvalidPasswordError;
class InvalidMoneyError extends DomainError {
    constructor(amount) {
        super(`Invalid money amount: ${amount}`);
    }
}
exports.InvalidMoneyError = InvalidMoneyError;
//# sourceMappingURL=domain-errors.js.map