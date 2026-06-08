import { Module } from '@nestjs/common';
import { GOAL_REPOSITORY } from '../domain/repositories/i-goal.repository';
import { PrismaGoalRepository } from './repositories/prisma-goal.repository';
import { GoalController } from './http/goal.controller';
import { CreateGoalUseCase } from '../application/use-cases/create-goal.use-case';

@Module({
  controllers: [GoalController],
  providers: [
    { provide: GOAL_REPOSITORY, useClass: PrismaGoalRepository },
    CreateGoalUseCase,
  ],
})
export class GoalsModule {}
