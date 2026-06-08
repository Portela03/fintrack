"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Goal = void 0;
const domain_1 = require("../../../../shared/domain");
class Goal extends domain_1.AggregateRoot {
    get userId() { return this.props.userId; }
    get name() { return this.props.name; }
    get type() { return this.props.type; }
    get targetAmount() { return this.props.targetAmount; }
    get currentAmount() { return this.props.currentAmount; }
    get deadline() { return this.props.deadline; }
    get progressPercentage() {
        if (this.props.targetAmount.amount === 0)
            return 0;
        return Math.min((this.props.currentAmount.amount / this.props.targetAmount.amount) * 100, 100);
    }
    addProgress(amount) {
        this.props = {
            ...this.props,
            currentAmount: this.props.currentAmount.add(amount),
        };
    }
    static create(props, id) {
        return new Goal(props, id);
    }
    static reconstitute(props) {
        return new Goal({ ...props }, props.id);
    }
}
exports.Goal = Goal;
//# sourceMappingURL=goal.entity.js.map