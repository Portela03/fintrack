"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRICEStrategy = void 0;
class PRICEStrategy {
    calculate(principal, monthlyRate, months) {
        const factor = Math.pow(1 + monthlyRate, months);
        const pmt = Number((principal * (monthlyRate * factor) / (factor - 1)).toFixed(2));
        const results = [];
        let balance = principal;
        for (let month = 1; month <= months; month++) {
            const interest = Number((balance * monthlyRate).toFixed(2));
            const principalPayment = Number((pmt - interest).toFixed(2));
            balance = Number((balance - principalPayment).toFixed(2));
            results.push({
                month,
                principal: principalPayment,
                interest,
                totalPayment: pmt,
                remainingBalance: Math.max(balance, 0),
            });
        }
        return results;
    }
}
exports.PRICEStrategy = PRICEStrategy;
//# sourceMappingURL=price.strategy.js.map