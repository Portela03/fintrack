import { Budget } from '../entities/budget.entity';

export interface IBudgetRepository {
  findById(id: string): Promise<Budget | null>;
  findAllByUserId(userId: string): Promise<Budget[]>;
  save(budget: Budget): Promise<void>;
  delete(id: string): Promise<void>;
}

export const BUDGET_REPOSITORY = Symbol('IBudgetRepository');
