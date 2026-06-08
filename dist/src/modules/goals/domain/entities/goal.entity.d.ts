import { AggregateRoot } from "../../../../shared/domain";
import { Money } from '../../../financial/domain/value-objects/money.vo';
export type GoalType = 'EMERGENCY_FUND' | 'TRAVEL' | 'PROPERTY' | 'VEHICLE' | 'OTHER';
interface GoalProps {
    userId: string;
    name: string;
    type: GoalType;
    targetAmount: Money;
    currentAmount: Money;
    deadline: Date | null;
}
export declare class Goal extends AggregateRoot<GoalProps> {
    get userId(): string;
    get name(): string;
    get type(): GoalType;
    get targetAmount(): Money;
    get currentAmount(): Money;
    get deadline(): Date | null;
    get progressPercentage(): number;
    addProgress(amount: Money): void;
    static create(props: GoalProps, id?: string): Goal;
    static reconstitute(props: GoalProps & {
        id: string;
    }): Goal;
}
export {};
