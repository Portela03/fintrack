import {
  AmortizationStrategy,
  FinancingInstallmentResult,
} from './amortization.strategy';

export class PRICEStrategy implements AmortizationStrategy {
  calculate(
    principal: number,
    monthlyRate: number,
    months: number,
  ): FinancingInstallmentResult[] {
    // PMT = PV * [r * (1+r)^n] / [(1+r)^n - 1]
    const factor = Math.pow(1 + monthlyRate, months);
    const pmt = Number((principal * (monthlyRate * factor) / (factor - 1)).toFixed(2));

    const results: FinancingInstallmentResult[] = [];
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
