import { Inject, Injectable } from '@nestjs/common';
import { IsString, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UseCase } from '@shared/application/use-case.interface';
import { Goal, GoalType } from '../../domain/entities/goal.entity';
import { Money } from '../../../financial/domain/value-objects/money.vo';
import { IGoalRepository, GOAL_REPOSITORY } from '../../domain/repositories/i-goal.repository';

export class CreateGoalDto {
  @ApiProperty() @IsString() name!: string;
  @ApiProperty({ enum: ['EMERGENCY_FUND', 'TRAVEL', 'PROPERTY', 'VEHICLE', 'OTHER'] })
  @IsEnum(['EMERGENCY_FUND', 'TRAVEL', 'PROPERTY', 'VEHICLE', 'OTHER'])
  type!: GoalType;
  @ApiProperty() @IsNumber() targetAmount!: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() deadline?: string;
}

export interface CreateGoalInput extends CreateGoalDto {
  userId: string;
}

export interface GoalWithProgress {
  id: string;
  name: string;
  type: string;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  deadline: Date | null;
  monthlySavingNeeded: number | null;
}

@Injectable()
export class CreateGoalUseCase implements UseCase<CreateGoalInput, { id: string }> {
  constructor(
    @Inject(GOAL_REPOSITORY)
    private readonly goalRepo: IGoalRepository,
  ) {}

  async execute(input: CreateGoalInput): Promise<{ id: string }> {
    const targetOrErr = Money.create(input.targetAmount);
    if (targetOrErr.isLeft()) throw targetOrErr.value;

    const goal = Goal.create({
      userId: input.userId,
      name: input.name,
      type: input.type,
      targetAmount: targetOrErr.value,
      currentAmount: Money.of(0),
      deadline: input.deadline ? new Date(input.deadline) : null,
    });

    await this.goalRepo.save(goal);
    return { id: goal.id };
  }
}
