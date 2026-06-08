"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Budget = void 0;
const domain_1 = require("../../../../shared/domain");
class Budget extends domain_1.AggregateRoot {
    get userId() { return this.props.userId; }
    get categoryId() { return this.props.categoryId; }
    get limitAmount() { return this.props.limitAmount; }
    get period() { return this.props.period; }
    get startDate() { return this.props.startDate; }
    static create(props, id) {
        return new Budget(props, id);
    }
    static reconstitute(props) {
        return new Budget({ ...props }, props.id);
    }
}
exports.Budget = Budget;
//# sourceMappingURL=budget.entity.js.map