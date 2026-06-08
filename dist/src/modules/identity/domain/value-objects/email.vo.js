"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
const domain_1 = require("../../../../shared/domain");
const domain_2 = require("../../../../shared/domain");
const domain_3 = require("../../../../shared/domain");
class Email extends domain_1.ValueObject {
    get value() {
        return this.props.value;
    }
    static create(email) {
        const normalized = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalized)) {
            return (0, domain_2.left)(new domain_3.InvalidEmailError(email));
        }
        return (0, domain_2.right)(new Email({ value: normalized }));
    }
}
exports.Email = Email;
//# sourceMappingURL=email.vo.js.map