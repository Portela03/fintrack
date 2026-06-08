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
exports.ListTransactionsUseCase = void 0;
const common_1 = require("@nestjs/common");
const i_transaction_repository_1 = require("../../../domain/repositories/i-transaction.repository");
let ListTransactionsUseCase = class ListTransactionsUseCase {
    transactionRepo;
    constructor(transactionRepo) {
        this.transactionRepo = transactionRepo;
    }
    async execute(filter) {
        const page = filter.page ?? 1;
        const limit = filter.limit ?? 20;
        const { data, total } = await this.transactionRepo.findMany({
            ...filter,
            page,
            limit,
        });
        return {
            data: data.map(this.toDto),
            total,
            page,
            limit,
        };
    }
    toDto(t) {
        return {
            id: t.id,
            amount: t.amount.amount,
            currency: t.amount.currency,
            type: t.type,
            date: t.date,
            description: t.description,
            categoryId: t.categoryId,
            status: t.status,
        };
    }
};
exports.ListTransactionsUseCase = ListTransactionsUseCase;
exports.ListTransactionsUseCase = ListTransactionsUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(i_transaction_repository_1.TRANSACTION_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], ListTransactionsUseCase);
//# sourceMappingURL=list-transactions.use-case.js.map