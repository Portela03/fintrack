import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  IPluggyConnectionPort,
  PLUGGY_CONNECTION_PORT,
} from '../../ports/i-pluggy.port';

export interface GetConnectTokenInput {
  userId: string;
}

export interface GetConnectTokenOutput {
  connectToken: string;
}

@Injectable()
export class GetConnectTokenUseCase
  implements UseCase<GetConnectTokenInput, GetConnectTokenOutput>
{
  constructor(
    @Inject(PLUGGY_CONNECTION_PORT)
    private readonly pluggyPort: IPluggyConnectionPort,
  ) {}

  async execute(input: GetConnectTokenInput): Promise<GetConnectTokenOutput> {
    const connectToken = await this.pluggyPort.createConnectToken(input.userId);
    return { connectToken };
  }
}
