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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSpendingReportUseCase = void 0;
const common_1 = require("@nestjs/common");
const i_transaction_repository_1 = require("../../../domain/repositories/i-transaction.repository");
const dayjs_1 = __importDefault(require("dayjs"));
let GetSpendingReportUseCase = class GetSpendingReportUseCase {
    transactionRepo;
    constructor(transactionRepo) {
        this.transactionRepo = transactionRepo;
    }
    async execute(input) {
        const { data } = await this.transactionRepo.findMany({
            userId: input.userId,
            from: input.from,
            to: input.to,
            limit: 10000,
        });
        let totalDebit = 0;
        let totalCredit = 0;
        const categoryMap = new Map();
        for (const tx of data) {
            const amt = tx.amount.amount;
            if (tx.type === 'DEBIT') {
                totalDebit += amt;
            }
            else {
                totalCredit += amt;
            }
            if (tx.type === 'DEBIT') {
                const key = tx.categoryId ?? 'uncategorized';
                const entry = categoryMap.get(key) ?? {
                    categoryId: tx.categoryId,
                    total: 0,
                    count: 0,
                };
                entry.total += amt;
                entry.count += 1;
                categoryMap.set(key, entry);
            }
        }
        return {
            totalDebit,
            totalCredit,
            byCategory: Array.from(categoryMap.values()).sort((a, b) => b.total - a.total),
            period: {
                from: (0, dayjs_1.default)(input.from).format('YYYY-MM-DD'),
                to: (0, dayjs_1.default)(input.to).format('YYYY-MM-DD'),
            },
        };
    }
};
exports.GetSpendingReportUseCase = GetSpendingReportUseCase;
exports.GetSpendingReportUseCase = GetSpendingReportUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(i_transaction_repository_1.TRANSACTION_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], GetSpendingReportUseCase);
//# sourceMappingURL=get-spending-report.use-case.js.map