import {
  AmortizationStrategy,
  FinancingInstallmentResult,
} from './amortization.strategy';

export class SACStrategy implements AmortizationStrategy {
  calculate(
    principal: number,
    monthlyRate: number,
    months: number,
  ): FinancingInstallmentResult[] {
    const principalPayment = Number((principal / months).toFixed(2));
    const results: FinancingInstallmentResult[] = [];
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
