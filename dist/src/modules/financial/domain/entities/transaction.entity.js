"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const domain_1 = require("../../../../shared/domain");
class Transaction extends domain_1.Entity {
    get userId() { return this.props.userId; }
    get accountId() { return this.props.accountId; }
    get pluggyTransactionId() { return this.props.pluggyTransactionId; }
    get amount() { return this.props.amount; }
    get type() { return this.props.type; }
    get date() { return this.props.date; }
    get description() { return this.props.description; }
    get categoryId() { return this.props.categoryId; }
    get status() { return this.props.status; }
    get paymentMethod() { return this.props.paymentMethod; }
    assignCategory(categoryId) {
        this.props = { ...this.props, categoryId };
    }
    static create(props, id) {
        return new Transaction({ ...props, status: props.status ?? 'POSTED' }, id);
    }
    static reconstitute(props) {
        return new Transaction({ ...props }, props.id);
    }
}
exports.Transaction = Transaction;
//# sourceMappingURL=transaction.entity.js.map