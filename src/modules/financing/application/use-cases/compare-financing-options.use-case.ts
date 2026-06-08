import { Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import { AmortizationStrategyFactory } from '../../domain/strategies/amortization-strategy.factory';

export interface CompareFinancingInput {
  loanAmount: number;
  monthlyRate: number;
  months: number;
}

@Injectable()
export class CompareFinancingOptionsUseCase
  implements UseCase<CompareFinancingInput, object>
{
  async execute(input: CompareFinancingInput): Promise<object> {
    const sacStrategy = AmortizationStrategyFactory.create('SAC');
    const priceStrategy = AmortizationStrategyFactory.create('PRICE');

    const sac = sacStrategy.calculate(input.loanAmount, input.monthlyRate / 100, input.months);
    const price = priceStrategy.calculate(input.loanAmount, input.monthlyRate / 100, input.months);

    const summarize = (installments: ReturnType<typeof sacStrategy.calculate>) => ({
      firstInstallment: installments[0].totalPayment,
      lastInstallment: installments[installments.length - 1].totalPayment,
      totalPaid: Number(installments.reduce((a, i) => a + i.totalPayment, 0).toFixed(2)),
      totalInterest: Number(installments.reduce((a, i) => a + i.interest, 0).toFixed(2)),
    });

    return {
      SAC: summarize(sac),
      PRICE: summarize(price),
      recommendation:
        summarize(sac).totalPaid < summarize(price).totalPaid
          ? 'SAC (menor custo total, primeira parcela maior)'
          : 'PRICE (parcela fixa, menor comprometimento mensal inicial)',
    };
  }
}
