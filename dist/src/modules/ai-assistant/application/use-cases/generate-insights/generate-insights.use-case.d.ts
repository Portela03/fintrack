import { UseCase } from "../../../../../shared/application/use-case.interface";
import { PrismaService } from "../../../../../shared/infrastructure/prisma.service";
import { IInsightPort } from '../../ports/i-llm.port';
export interface GenerateInsightsInput {
    userId: string;
}
export declare class GenerateInsightsUseCase implements UseCase<GenerateInsightsInput, {
    insights: string;
}> {
    private readonly insightPort;
    private readonly prisma;
    constructor(insightPort: IInsightPort, prisma: PrismaService);
    execute(input: GenerateInsightsInput): Promise<{
        insights: string;
    }>;
}
