"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
const domain_1 = require("../../../../shared/domain");
const domain_2 = require("../../../../shared/domain");
const domain_3 = require("../../../../shared/domain");
class Money extends domain_1.ValueObject {
    get amount() { return this.props.amount; }
    get currency() { return this.props.currency; }
    static create(amount, currency = 'BRL') {
        if (!isFinite(amount)) {
            return (0, domain_3.left)(new domain_2.InvalidMoneyError(amount));
        }
        return (0, domain_3.right)(new Money({ amount: Number(amount.toFixed(2)), currency }));
    }
    static of(amount, currency = 'BRL') {
        return new Money({ amount: Number(amount.toFixed(2)), currency });
    }
    add(other) {
        return Money.of(this.amount + other.amount, this.currency);
    }
    subtract(other) {
        return Money.of(this.amount - other.amount, this.currency);
    }
    isPositive() {
        return this.amount > 0;
    }
    format() {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: this.currency,
        }).format(this.amount);
    }
}
exports.Money = Money;
//# sourceMappingURL=money.vo.js.map