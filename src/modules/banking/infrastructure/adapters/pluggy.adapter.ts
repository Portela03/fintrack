import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PluggyClient } from 'pluggy-sdk';
import { ConfigService } from '@nestjs/config';
import {
  IPluggyConnectionPort,
  IPluggyDataPort,
  PluggyAccount,
  PluggyTransaction,
  PluggyInvestment,
} from '../../application/ports/i-pluggy.port';

@Injectable()
export class PluggyAdapter implements IPluggyConnectionPort, IPluggyDataPort {
  private _client: PluggyClient | null = null;

  constructor(private readonly config: ConfigService) {}

  private get client(): PluggyClient {
    if (!this._client) {
      const clientId = this.config.get<string>('PLUGGY_CLIENT_ID', '');
      const clientSecret = this.config.get<string>('PLUGGY_CLIENT_SECRET', '');
      if (!clientId || !clientSecret) {
        throw new ServiceUnavailableException(
          'PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET não configurados. Adicione as credenciais no arquivo .env.',
        );
      }
      this._client = new PluggyClient({ clientId, clientSecret });
    }
    return this._client;
  }

  async createConnectToken(clientUserId: string): Promise<string> {
    const result = await this.client.createConnectToken(undefined, {
      clientUserId,
    });
    return result.accessToken;
  }

  async getItemStatus(itemId: string): Promise<string> {
    const item = await this.client.fetchItem(itemId);
    return item.status;
  }

  async getAccounts(itemId: string): Promise<PluggyAccount[]> {
    const result = await this.client.fetchAccounts(itemId);
    return result.results.map((a) => ({
      id: a.id,
      type: a.type,
      subtype: a.subtype ?? 'UNKNOWN',
      name: a.name,
      balance: Number(a.balance),
      currencyCode: a.currencyCode ?? 'BRL',
    }));
  }

  async getTransactions(
    accountId: string,
    from?: Date,
    to?: Date,
  ): Promise<PluggyTransaction[]> {
    const params: Record<string, unknown> = {};
    if (from) params.from = from.toISOString().split('T')[0];
    if (to) params.to = to.toISOString().split('T')[0];

    const result = await this.client.fetchTransactions(accountId, params as Parameters<typeof this.client.fetchTransactions>[1]);
    return result.results.map((t) => ({
      id: t.id,
      date: t.date instanceof Date ? t.date.toISOString() : String(t.date),
      description: t.description,
      amount: Number(t.amount),
      type: t.type,
      status: t.status,
      currencyCode: t.currencyCode ?? 'BRL',
    }));
  }

  async getInvestments(itemId: string): Promise<PluggyInvestment[]> {
    const result = await this.client.fetchInvestments(itemId);
    return result.results.map((i) => ({
      id: i.id,
      name: i.name,
      type: i.type,
      subtype: i.subtype ?? undefined,
      balance: Number(i.balance),
      amount: i.amount !== undefined ? Number(i.amount) : undefined,
      amountProfit: i.amountProfit !== undefined ? Number(i.amountProfit) : undefined,
      annualRate: i.annualRate ?? undefined,
      rateType: i.rateType ?? undefined,
      dueDate: i.dueDate instanceof Date ? i.dueDate.toISOString() : i.dueDate ?? undefined,
      status: i.status,
      currencyCode: i.currencyCode ?? 'BRL',
    }));
  }
}
