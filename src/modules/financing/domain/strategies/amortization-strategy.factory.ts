import { SACStrategy } from './sac.strategy';
import { PRICEStrategy } from './price.strategy';
import { AmortizationStrategy } from './amortization.strategy';

export class AmortizationStrategyFactory {
  static create(type: 'SAC' | 'PRICE'): AmortizationStrategy {
    switch (type) {
      case 'SAC':
        return new SACStrategy();
      case 'PRICE':
        return new PRICEStrategy();
    }
  }
}
