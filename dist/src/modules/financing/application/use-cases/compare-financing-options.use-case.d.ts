import { UseCase } from "../../../../shared/application/use-case.interface";
export interface CompareFinancingInput {
    loanAmount: number;
    monthlyRate: number;
    months: number;
}
export declare class CompareFinancingOptionsUseCase implements UseCase<CompareFinancingInput, object> {
    execute(input: CompareFinancingInput): Promise<object>;
}
