import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  IConnectionRepository,
  CONNECTION_REPOSITORY,
} from '../../../domain/repositories/i-connection.repository';
import {
  IBankAccountRepository,
  BANK_ACCOUNT_REPOSITORY,
} from '../../../domain/repositories/i-bank-account.repository';

export interface ListAccountsInput {
  userId: string;
  connectionId: string;
}

export interface AccountDto {
  id: string;
  name: string;
  type: string;
  subtype: string;
  balance: number;
  currencyCode: string;
}

@Injectable()
export class ListAccountsUseCase
  implements UseCase<ListAccountsInput, AccountDto[]>
{
  constructor(
    @Inject(CONNECTION_REPOSITORY)
    private readonly connectionRepo: IConnectionRepository,
    @Inject(BANK_ACCOUNT_REPOSITORY)
    private readonly bankAccountRepo: IBankAccountRepository,
  ) {}

  async execute(input: ListAccountsInput): Promise<AccountDto[]> {
    const connection = await this.connectionRepo.findById(input.connectionId);
    if (!connection) {
      throw new NotFoundException('Connection not found');
    }
    if (connection.userId !== input.userId) {
      throw new ForbiddenException('Access denied');
    }

    const accounts = await this.bankAccountRepo.findAllByConnectionId(input.connectionId);

    return accounts.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      subtype: a.subtype,
      balance: a.balance,
      currencyCode: a.currencyCode,
    }));
  }
}
