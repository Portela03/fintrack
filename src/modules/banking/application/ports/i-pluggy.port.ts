export interface IPluggyConnectionPort {
  createConnectToken(clientUserId: string): Promise<string>;
  getItemStatus(itemId: string): Promise<string>;
}

export interface IPluggyDataPort {
  getAccounts(itemId: string): Promise<PluggyAccount[]>;
  getTransactions(
    accountId: string,
    from?: Date,
    to?: Date,
  ): Promise<PluggyTransaction[]>;
  getInvestments(itemId: string): Promise<PluggyInvestment[]>;
}

export interface PluggyAccount {
  id: string;
  type: string;
  subtype: string;
  name: string;
  balance: number;
  currencyCode: string;
}

export interface PluggyTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  status?: string;
  currencyCode: string;
  paymentData?: { paymentMethod?: string };
}

export interface PluggyInvestment {
  id: string;
  name: string;
  type: string;
  subtype?: string;
  balance: number;
  amount?: number;
  amountProfit?: number;
  annualRate?: number;
  rateType?: string;
  dueDate?: string;
  status?: string | null;
  currencyCode: string;
}

export const PLUGGY_CONNECTION_PORT = Symbol('IPluggyConnectionPort');
export const PLUGGY_DATA_PORT = Symbol('IPluggyDataPort');
