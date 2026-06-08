import { Module } from '@nestjs/common';
import { FinancingController } from './http/financing.controller';
import { CreateFinancingSimulationUseCase } from '../application/use-cases/create-financing-simulation.use-case';
import { CompareFinancingOptionsUseCase } from '../application/use-cases/compare-financing-options.use-case';

@Module({
  controllers: [FinancingController],
  providers: [CreateFinancingSimulationUseCase, CompareFinancingOptionsUseCase],
})
export class FinancingModule {}
