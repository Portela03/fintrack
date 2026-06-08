import { PrismaService } from "../../../../shared/infrastructure/prisma.service";
import { IConnectionRepository } from '../../domain/repositories/i-connection.repository';
import { PluggyConnection } from '../../domain/entities/pluggy-connection.entity';
export declare class PrismaConnectionRepository implements IConnectionRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<PluggyConnection | null>;
    findByItemId(itemId: string): Promise<PluggyConnection | null>;
    findAllByUserId(userId: string): Promise<PluggyConnection[]>;
    save(connection: PluggyConnection): Promise<void>;
    update(connection: PluggyConnection): Promise<void>;
}
