"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompareFinancingOptionsUseCase = void 0;
const common_1 = require("@nestjs/common");
const amortization_strategy_factory_1 = require("../../domain/strategies/amortization-strategy.factory");
let CompareFinancingOptionsUseCase = class CompareFinancingOptionsUseCase {
    async execute(input) {
        const sacStrategy = amortization_strategy_factory_1.AmortizationStrategyFactory.create('SAC');
        const priceStrategy = amortization_strategy_factory_1.AmortizationStrategyFactory.create('PRICE');
        const sac = sacStrategy.calculate(input.loanAmount, input.monthlyRate / 100, input.months);
        const price = priceStrategy.calculate(input.loanAmount, input.monthlyRate / 100, input.months);
        const summarize = (installments) => ({
            firstInstallment: installments[0].totalPayment,
            lastInstallment: installments[installments.length - 1].totalPayment,
            totalPaid: Number(installments.reduce((a, i) => a + i.totalPayment, 0).toFixed(2)),
            totalInterest: Number(installments.reduce((a, i) => a + i.interest, 0).toFixed(2)),
        });
        return {
            SAC: summarize(sac),
            PRICE: summarize(price),
            recommendation: summarize(sac).totalPaid < summarize(price).totalPaid
                ? 'SAC (menor custo total, primeira parcela maior)'
                : 'PRICE (parcela fixa, menor comprometimento mensal inicial)',
        };
    }
};
exports.CompareFinancingOptionsUseCase = CompareFinancingOptionsUseCase;
exports.CompareFinancingOptionsUseCase = CompareFinancingOptionsUseCase = __decorate([
    (0, common_1.Injectable)()
], CompareFinancingOptionsUseCase);
//# sourceMappingURL=compare-financing-options.use-case.js.map