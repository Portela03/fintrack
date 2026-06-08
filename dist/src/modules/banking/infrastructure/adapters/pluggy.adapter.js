"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluggyAdapter = void 0;
const common_1 = require("@nestjs/common");
const pluggy_sdk_1 = require("pluggy-sdk");
const config_1 = require("@nestjs/config");
let PluggyAdapter = class PluggyAdapter {
    config;
    _client = null;
    constructor(config) {
        this.config = config;
    }
    get client() {
        if (!this._client) {
            const clientId = this.config.get('PLUGGY_CLIENT_ID', '');
            const clientSecret = this.config.get('PLUGGY_CLIENT_SECRET', '');
            if (!clientId || !clientSecret) {
                throw new common_1.ServiceUnavailableException('PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET não configurados. Adicione as credenciais no arquivo .env.');
            }
            this._client = new pluggy_sdk_1.PluggyClient({ clientId, clientSecret });
        }
        return this._client;
    }
    async createConnectToken(clientUserId) {
        const result = await this.client.createConnectToken(undefined, {
            clientUserId,
        });
        return result.accessToken;
    }
    async getItemStatus(itemId) {
        const item = await this.client.fetchItem(itemId);
        return item.status;
    }
    async getAccounts(itemId) {
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
    async getTransactions(accountId, from, to) {
        const params = {};
        if (from)
            params.from = from.toISOString().split('T')[0];
        if (to)
            params.to = to.toISOString().split('T')[0];
        const result = await this.client.fetchTransactions(accountId, params);
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
    async getInvestments(itemId) {
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
};
exports.PluggyAdapter = PluggyAdapter;
exports.PluggyAdapter = PluggyAdapter = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PluggyAdapter);
//# sourceMappingURL=pluggy.adapter.js.map