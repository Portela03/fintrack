import { AmortizationStrategy } from './amortization.strategy';
export declare class AmortizationStrategyFactory {
    static create(type: 'SAC' | 'PRICE'): AmortizationStrategy;
}
