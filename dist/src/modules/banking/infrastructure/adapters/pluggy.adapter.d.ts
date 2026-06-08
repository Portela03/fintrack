import { ConfigService } from '@nestjs/config';
import { IPluggyConnectionPort, IPluggyDataPort, PluggyAccount, PluggyTransaction, PluggyInvestment } from '../../application/ports/i-pluggy.port';
export declare class PluggyAdapter implements IPluggyConnectionPort, IPluggyDataPort {
    private readonly config;
    private _client;
    constructor(config: ConfigService);
    private get client();
    createConnectToken(clientUserId: string): Promise<string>;
    getItemStatus(itemId: string): Promise<string>;
    getAccounts(itemId: string): Promise<PluggyAccount[]>;
    getTransactions(accountId: string, from?: Date, to?: Date): Promise<PluggyTransaction[]>;
    getInvestments(itemId: string): Promise<PluggyInvestment[]>;
}
