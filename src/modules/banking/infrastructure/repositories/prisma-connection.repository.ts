import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma.service';
import { IConnectionRepository } from '../../domain/repositories/i-connection.repository';
import { PluggyConnection } from '../../domain/entities/pluggy-connection.entity';

@Injectable()
export class PrismaConnectionRepository implements IConnectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<PluggyConnection | null> {
    const row = await this.prisma.pluggyConnection.findUnique({ where: { id } });
    if (!row) return null;
    return PluggyConnection.reconstitute(row);
  }

  async findByItemId(itemId: string): Promise<PluggyConnection | null> {
    const row = await this.prisma.pluggyConnection.findUnique({ where: { itemId } });
    if (!row) return null;
    return PluggyConnection.reconstitute(row);
  }

  async findAllByUserId(userId: string): Promise<PluggyConnection[]> {
    const rows = await this.prisma.pluggyConnection.findMany({ where: { userId } });
    return rows.map((r) => PluggyConnection.reconstitute(r));
  }

  async save(connection: PluggyConnection): Promise<void> {
    await this.prisma.pluggyConnection.create({
      data: {
        id: connection.id,
        userId: connection.userId,
        itemId: connection.itemId,
        status: connection.status,
        lastSyncAt: connection.lastSyncAt,
      },
    });
  }

  async update(connection: PluggyConnection): Promise<void> {
    await this.prisma.pluggyConnection.update({
      where: { id: connection.id },
      data: {
        status: connection.status,
        lastSyncAt: connection.lastSyncAt,
      },
    });
  }
}
