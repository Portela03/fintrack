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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../identity/infrastructure/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../../identity/infrastructure/decorators/current-user.decorator");
const list_transactions_use_case_1 = require("../../application/use-cases/list-transactions/list-transactions.use-case");
const get_spending_report_use_case_1 = require("../../application/use-cases/get-spending-report/get-spending-report.use-case");
let TransactionController = class TransactionController {
    listTransactions;
    getSpendingReport;
    constructor(listTransactions, getSpendingReport) {
        this.listTransactions = listTransactions;
        this.getSpendingReport = getSpendingReport;
    }
    async list(user, page, limit, from, to) {
        return this.listTransactions.execute({
            userId: user.sub,
            page,
            limit,
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
        });
    }
    async report(user, from, to) {
        const now = new Date();
        return this.getSpendingReport.execute({
            userId: user.sub,
            from: from ? new Date(from) : new Date(now.getFullYear(), now.getMonth(), 1),
            to: to ? new Date(to) : now,
        });
    }
};
exports.TransactionController = TransactionController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Listar transações',
        description: 'Retorna as transações do usuário com paginação e filtros de data. As transações são sincronizadas automaticamente pelo Pluggy quando a conexão bancária é atualizada.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Número da página (padrão: 1)', example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Itens por página (padrão: 20)', example: 20 }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false, description: 'Data inicial (ISO 8601)', example: '2026-01-01' }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false, description: 'Data final (ISO 8601)', example: '2026-12-31' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Lista paginada de transações.' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Token JWT ausente ou inválido.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('from')),
    __param(4, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('report'),
    (0, swagger_1.ApiOperation)({
        summary: 'Relatório de gastos por categoria',
        description: 'Agrupa as transações por categoria e retorna totais de receitas e despesas. Padrão: mês atual. Ideal para construir gráficos de pizza ou barras no frontend.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false, description: 'Data inicial (padrão: primeiro dia do mês atual)', example: '2026-06-01' }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false, description: 'Data final (padrão: hoje)', example: '2026-06-30' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Relatório com totais por categoria.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "report", null);
exports.TransactionController = TransactionController = __decorate([
    (0, swagger_1.ApiTags)('3. Financial'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [list_transactions_use_case_1.ListTransactionsUseCase,
        get_spending_report_use_case_1.GetSpendingReportUseCase])
], TransactionController);
//# sourceMappingURL=transaction.controller.js.map