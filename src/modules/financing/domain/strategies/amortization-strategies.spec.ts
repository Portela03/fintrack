import { SACStrategy } from './sac.strategy';
import { PRICEStrategy } from './price.strategy';
import { AmortizationStrategyFactory } from './amortization-strategy.factory';

describe('AmortizationStrategies', () => {
  const principal = 300_000;
  const monthlyRate = 0.01; // 1% a.m.
  const months = 360; // 30 anos

  describe('SAC Strategy', () => {
    let strategy: SACStrategy;
    beforeEach(() => { strategy = new SACStrategy(); });

    it('should generate correct number of installments', () => {
      const result = strategy.calculate(principal, monthlyRate, months);
      expect(result).toHaveLength(months);
    });

    it('first installment should be higher than last (decreasing)', () => {
      const result = strategy.calculate(principal, monthlyRate, months);
      expect(result[0].totalPayment).toBeGreaterThan(result[months - 1].totalPayment);
    });

    it('remaining balance should approach zero at the end', () => {
      const result = strategy.calculate(principal, monthlyRate, months);
      expect(result[months - 1].remainingBalance).toBeLessThan(2);
    });

    it('principal portion should be constant', () => {
      const result = strategy.calculate(principal, monthlyRate, months);
      const principalPayment = principal / months;
      expect(result[0].principal).toBeCloseTo(principalPayment, 0);
      expect(result[100].principal).toBeCloseTo(principalPayment, 0);
    });
  });

  describe('PRICE Strategy', () => {
    let strategy: PRICEStrategy;
    beforeEach(() => { strategy = new PRICEStrategy(); });

    it('should generate correct number of installments', () => {
      const result = strategy.calculate(principal, monthlyRate, months);
      expect(result).toHaveLength(months);
    });

    it('all installments should have the same totalPayment (PMT)', () => {
      const result = strategy.calculate(principal, monthlyRate, months);
      const firstPmt = result[0].totalPayment;
      result.forEach((r) => {
        expect(Math.abs(r.totalPayment - firstPmt)).toBeLessThan(0.1);
      });
    });

    it('remaining balance should approach zero at the end', () => {
      const result = strategy.calculate(principal, monthlyRate, months);
      expect(result[months - 1].remainingBalance).toBeLessThan(1);
    });
  });

  describe('Factory', () => {
    it('should return SACStrategy for SAC', () => {
      expect(AmortizationStrategyFactory.create('SAC')).toBeInstanceOf(SACStrategy);
    });

    it('should return PRICEStrategy for PRICE', () => {
      expect(AmortizationStrategyFactory.create('PRICE')).toBeInstanceOf(PRICEStrategy);
    });
  });
});
