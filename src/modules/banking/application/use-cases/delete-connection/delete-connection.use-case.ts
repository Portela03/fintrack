import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  IConnectionRepository,
  CONNECTION_REPOSITORY,
} from '../../../domain/repositories/i-connection.repository';
import { PrismaService } from '@shared/infrastructure/prisma.service';

export interface DeleteConnectionInput {
  userId: string;
  connectionId: string;
}

@Injectable()
export class DeleteConnectionUseCase
  implements UseCase<DeleteConnectionInput, void>
{
  constructor(
    @Inject(CONNECTION_REPOSITORY)
    private readonly connectionRepo: IConnectionRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: DeleteConnectionInput): Promise<void> {
    const connection = await this.connectionRepo.findById(input.connectionId);
    if (!connection) {
      throw new NotFoundException('Connection not found');
    }
    if (connection.userId !== input.userId) {
      throw new ForbiddenException('Access denied');
    }

    // onDelete: Cascade will remove BankAccounts and Transactions
    await this.prisma.pluggyConnection.delete({ where: { id: input.connectionId } });
  }
}
