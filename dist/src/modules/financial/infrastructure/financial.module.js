"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialModule = void 0;
const common_1 = require("@nestjs/common");
const i_transaction_repository_1 = require("../domain/repositories/i-transaction.repository");
const prisma_transaction_repository_1 = require("./repositories/prisma-transaction.repository");
const transaction_controller_1 = require("./http/transaction.controller");
const list_transactions_use_case_1 = require("../application/use-cases/list-transactions/list-transactions.use-case");
const get_spending_report_use_case_1 = require("../application/use-cases/get-spending-report/get-spending-report.use-case");
let FinancialModule = class FinancialModule {
};
exports.FinancialModule = FinancialModule;
exports.FinancialModule = FinancialModule = __decorate([
    (0, common_1.Module)({
        controllers: [transaction_controller_1.TransactionController],
        providers: [
            { provide: i_transaction_repository_1.TRANSACTION_REPOSITORY, useClass: prisma_transaction_repository_1.PrismaTransactionRepository },
            list_transactions_use_case_1.ListTransactionsUseCase,
            get_spending_report_use_case_1.GetSpendingReportUseCase,
        ],
        exports: [i_transaction_repository_1.TRANSACTION_REPOSITORY],
    })
], FinancialModule);
//# sourceMappingURL=financial.module.js.map