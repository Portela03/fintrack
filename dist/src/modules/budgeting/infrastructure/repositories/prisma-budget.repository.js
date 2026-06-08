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
exports.PrismaBudgetRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../shared/infrastructure/prisma.service");
const budget_entity_1 = require("../../domain/entities/budget.entity");
const money_vo_1 = require("../../../financial/domain/value-objects/money.vo");
let PrismaBudgetRepository = class PrismaBudgetRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.budget.findUnique({ where: { id } });
        if (!row)
            return null;
        return this.toEntity(row);
    }
    async findAllByUserId(userId) {
        const rows = await this.prisma.budget.findMany({ where: { userId } });
        return rows.map((r) => this.toEntity(r));
    }
    async save(budget) {
        await this.prisma.budget.create({
            data: {
                id: budget.id,
                userId: budget.userId,
                categoryId: budget.categoryId,
                limitAmount: budget.limitAmount.amount,
                period: budget.period,
                startDate: budget.startDate,
            },
        });
    }
    async delete(id) {
        await this.prisma.budget.delete({ where: { id } });
    }
    toEntity(row) {
        const amount = typeof row.limitAmount === 'object' && 'toNumber' in row.limitAmount
            ? row.limitAmount.toNumber()
            : Number(row.limitAmount);
        return budget_entity_1.Budget.reconstitute({
            id: row.id,
            userId: row.userId,
            categoryId: row.categoryId,
            limitAmount: money_vo_1.Money.of(amount),
            period: row.period,
            startDate: row.startDate,
        });
    }
};
exports.PrismaBudgetRepository = PrismaBudgetRepository;
exports.PrismaBudgetRepository = PrismaBudgetRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaBudgetRepository);
//# sourceMappingURL=prisma-budget.repository.js.map