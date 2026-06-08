"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SACStrategy = void 0;
class SACStrategy {
    calculate(principal, monthlyRate, months) {
        const principalPayment = Number((principal / months).toFixed(2));
        const results = [];
        let balance = principal;
        for (let month = 1; month <= months; month++) {
            const interest = Number((balance * monthlyRate).toFixed(2));
            const totalPayment = Number((principalPayment + interest).toFixed(2));
            balance = Number((balance - principalPayment).toFixed(2));
            results.push({
                month,
                principal: principalPayment,
                interest,
                totalPayment,
                remainingBalance: Math.max(balance, 0),
            });
        }
        return results;
    }
}
exports.SACStrategy = SACStrategy;
//# sourceMappingURL=sac.strategy.js.map