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
exports.PrismaTransactionRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../shared/infrastructure/prisma.service");
const transaction_entity_1 = require("../../domain/entities/transaction.entity");
const money_vo_1 = require("../../domain/value-objects/money.vo");
let PrismaTransactionRepository = class PrismaTransactionRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.transaction.findUnique({ where: { id } });
        if (!row)
            return null;
        return this.toEntity(row);
    }
    async findByPluggyId(pluggyId) {
        const row = await this.prisma.transaction.findUnique({
            where: { pluggyTransactionId: pluggyId },
        });
        if (!row)
            return null;
        return this.toEntity(row);
    }
    async findMany(filter) {
        const where = { userId: filter.userId };
        if (filter.accountId)
            where['accountId'] = filter.accountId;
        if (filter.categoryId)
            where['categoryId'] = filter.categoryId;
        if (filter.type)
            where['type'] = filter.type;
        if (filter.from || filter.to) {
            where['date'] = {};
            if (filter.from)
                where['date']['gte'] = filter.from;
            if (filter.to)
                where['date']['lte'] = filter.to;
        }
        const page = filter.page ?? 1;
        const limit = filter.limit ?? 20;
        const [rows, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where,
                orderBy: { date: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.transaction.count({ where }),
        ]);
        return { data: rows.map((r) => this.toEntity(r)), total };
    }
    async save(transaction) {
        await this.prisma.transaction.create({
            data: {
                id: transaction.id,
                userId: transaction.userId,
                accountId: transaction.accountId,
                pluggyTransactionId: transaction.pluggyTransactionId,
                amount: transaction.amount.amount,
                type: transaction.type,
                date: transaction.date,
                description: transaction.description,
                categoryId: transaction.categoryId,
                status: transaction.status,
                paymentMethod: transaction.paymentMethod,
                currencyCode: transaction.amount.currency,
            },
        });
    }
    async saveMany(transactions) {
        await this.prisma.transaction.createMany({
            data: transactions.map((t) => ({
                id: t.id,
                userId: t.userId,
                accountId: t.accountId,
                pluggyTransactionId: t.pluggyTransactionId,
                amount: t.amount.amount,
                type: t.type,
                date: t.date,
                description: t.description,
                categoryId: t.categoryId,
                status: t.status,
                paymentMethod: t.paymentMethod,
                currencyCode: t.amount.currency,
            })),
            skipDuplicates: true,
        });
    }
    async update(transaction) {
        await this.prisma.transaction.update({
            where: { id: transaction.id },
            data: { categoryId: transaction.categoryId },
        });
    }
    toEntity(row) {
        const amount = typeof row.amount === 'object' && 'toNumber' in row.amount
            ? row.amount.toNumber()
            : Number(row.amount);
        return transaction_entity_1.Transaction.reconstitute({
            id: row.id,
            userId: row.userId,
            accountId: row.accountId,
            pluggyTransactionId: row.pluggyTransactionId,
            amount: money_vo_1.Money.of(amount, row.currencyCode),
            type: row.type,
            date: row.date,
            description: row.description,
            categoryId: row.categoryId,
            status: row.status,
            paymentMethod: row.paymentMethod,
        });
    }
};
exports.PrismaTransactionRepository = PrismaTransactionRepository;
exports.PrismaTransactionRepository = PrismaTransactionRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaTransactionRepository);
//# sourceMappingURL=prisma-transaction.repository.js.map