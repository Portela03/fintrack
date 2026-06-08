import { UseCase } from "../../../../shared/application/use-case.interface";
import { PrismaService } from "../../../../shared/infrastructure/prisma.service";
export declare class CreateSimulationDto {
    name: string;
    propertyValue: number;
    downPayment: number;
    loanMonths: number;
    monthlyRate: number;
    amortizationType: 'SAC' | 'PRICE';
}
export interface CreateSimulationInput extends CreateSimulationDto {
    userId: string;
}
export declare class CreateFinancingSimulationUseCase implements UseCase<CreateSimulationInput, {
    id: string;
    summary: object;
}> {
    private readonly prisma;
    constructor(prisma: PrismaService);
    execute(input: CreateSimulationInput): Promise<{
        id: string;
        summary: object;
    }>;
}
