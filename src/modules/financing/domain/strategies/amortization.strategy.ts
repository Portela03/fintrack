export interface FinancingInstallmentResult {
  month: number;
  principal: number;
  interest: number;
  totalPayment: number;
  remainingBalance: number;
}

export interface AmortizationStrategy {
  calculate(
    principal: number,
    monthlyRate: number,
    months: number,
  ): FinancingInstallmentResult[];
}
