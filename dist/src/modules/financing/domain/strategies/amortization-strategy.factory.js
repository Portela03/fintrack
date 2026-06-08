"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmortizationStrategyFactory = void 0;
const sac_strategy_1 = require("./sac.strategy");
const price_strategy_1 = require("./price.strategy");
class AmortizationStrategyFactory {
    static create(type) {
        switch (type) {
            case 'SAC':
                return new sac_strategy_1.SACStrategy();
            case 'PRICE':
                return new price_strategy_1.PRICEStrategy();
        }
    }
}
exports.AmortizationStrategyFactory = AmortizationStrategyFactory;
//# sourceMappingURL=amortization-strategy.factory.js.map