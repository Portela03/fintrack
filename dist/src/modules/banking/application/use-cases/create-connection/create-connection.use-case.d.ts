import { Queue } from 'bullmq';
import { UseCase } from "../../../../../shared/application/use-case.interface";
import { IPluggyConnectionPort } from '../../ports/i-pluggy.port';
import { IConnectionRepository } from '../../../domain/repositories/i-connection.repository';
export interface CreateConnectionInput {
    userId: string;
    itemId: string;
}
export interface CreateConnectionOutput {
    connectToken: string;
    connectionId: string;
}
export declare class CreateConnectionUseCase implements UseCase<CreateConnectionInput, CreateConnectionOutput> {
    private readonly pluggyPort;
    private readonly connectionRepo;
    private readonly syncQueue;
    constructor(pluggyPort: IPluggyConnectionPort, connectionRepo: IConnectionRepository, syncQueue: Queue);
    execute(input: CreateConnectionInput): Promise<CreateConnectionOutput>;
}
