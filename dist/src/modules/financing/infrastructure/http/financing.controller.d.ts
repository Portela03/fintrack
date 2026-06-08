import { TokenPayload } from '../../../identity/application/ports/i-token-generator.port';
import { CreateFinancingSimulationUseCase, CreateSimulationDto } from '../../application/use-cases/create-financing-simulation.use-case';
import { CompareFinancingOptionsUseCase } from '../../application/use-cases/compare-financing-options.use-case';
import { PrismaService } from "../../../../shared/infrastructure/prisma.service";
declare class CompareDto {
    loanAmount: number;
    monthlyRate: number;
    months: number;
}
export declare class FinancingController {
    private readonly createSimulation;
    private readonly compareOptions;
    private readonly prisma;
    constructor(createSimulation: CreateFinancingSimulationUseCase, compareOptions: CompareFinancingOptionsUseCase, prisma: PrismaService);
    create(dto: CreateSimulationDto, user: TokenPayload): Promise<{
        id: string;
        summary: object;
    }>;
    list(user: TokenPayload): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        propertyValue: import("@prisma/client-runtime-utils").Decimal;
        downPayment: import("@prisma/client-runtime-utils").Decimal;
        loanMonths: number;
        monthlyRate: number;
        amortizationType: string;
    }[]>;
    getInstallments(id: string): Promise<{
        id: string;
        simulationId: string;
        month: number;
        principal: import("@prisma/client-runtime-utils").Decimal;
        interest: import("@prisma/client-runtime-utils").Decimal;
        totalPayment: import("@prisma/client-runtime-utils").Decimal;
        remainingBalance: import("@prisma/client-runtime-utils").Decimal;
    }[]>;
    compare(dto: CompareDto): Promise<object>;
}
export {};
