import { AmortizationStrategy, FinancingInstallmentResult } from './amortization.strategy';
export declare class SACStrategy implements AmortizationStrategy {
    calculate(principal: number, monthlyRate: number, months: number): FinancingInstallmentResult[];
}
