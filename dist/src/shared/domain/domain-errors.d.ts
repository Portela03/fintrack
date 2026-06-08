export declare class DomainError extends Error {
    constructor(message: string);
}
export declare class InvalidEmailError extends DomainError {
    constructor(email: string);
}
export declare class InvalidPasswordError extends DomainError {
    constructor(reason: string);
}
export declare class InvalidMoneyError extends DomainError {
    constructor(amount: number);
}
