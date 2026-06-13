import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  IConnectionRepository,
  CONNECTION_REPOSITORY,
} from '../../../domain/repositories/i-connection.repository';
import {
  IBankAccountRepository,
  BANK_ACCOUNT_REPOSITORY,
} from '../../../domain/repositories/i-bank-account.repository';

export interface ListConnectionsInput {
  userId: string;
}

export interface ConnectionDto {
  id: string;
  itemId: string;
  status: string;
  lastSyncAt: Date | null;
  createdAt: Date;
}

@Injectable()
export class ListConnectionsUseCase
  implements UseCase<ListConnectionsInput, ConnectionDto[]>
{
  constructor(
    @Inject(CONNECTION_REPOSITORY)
    private readonly connectionRepo: IConnectionRepository,
    @Inject(BANK_ACCOUNT_REPOSITORY)
    private readonly bankAccountRepo: IBankAccountRepository,
  ) {}

  async execute(input: ListConnectionsInput): Promise<ConnectionDto[]> {
    const connections = await this.connectionRepo.findAllByUserId(input.userId);

    return connections.map((c) => ({
      id: c.id,
      itemId: c.itemId,
      status: c.status,
      lastSyncAt: c.lastSyncAt,
      createdAt: c.createdAt,
    }));
  }
}
