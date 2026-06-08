"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const domain_1 = require("../../../../shared/domain");
class User extends domain_1.AggregateRoot {
    get email() {
        return this.props.email;
    }
    get name() {
        return this.props.name;
    }
    get passwordHash() {
        return this.props.passwordHash;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    static create(props, id) {
        return new User({ ...props, createdAt: new Date() }, id);
    }
    static reconstitute(props) {
        return new User({
            email: props.email,
            name: props.name,
            passwordHash: props.passwordHash,
            createdAt: props.createdAt,
        }, props.id);
    }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map