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
exports.PrismaGoalRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../shared/infrastructure/prisma.service");
const goal_entity_1 = require("../../domain/entities/goal.entity");
const money_vo_1 = require("../../../financial/domain/value-objects/money.vo");
let PrismaGoalRepository = class PrismaGoalRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.goal.findUnique({ where: { id } });
        if (!row)
            return null;
        return this.toEntity(row);
    }
    async findAllByUserId(userId) {
        const rows = await this.prisma.goal.findMany({ where: { userId } });
        return rows.map((r) => this.toEntity(r));
    }
    async save(goal) {
        await this.prisma.goal.create({
            data: {
                id: goal.id, userId: goal.userId, name: goal.name, type: goal.type,
                targetAmount: goal.targetAmount.amount,
                currentAmount: goal.currentAmount.amount,
                deadline: goal.deadline,
            },
        });
    }
    async update(goal) {
        await this.prisma.goal.update({
            where: { id: goal.id },
            data: { currentAmount: goal.currentAmount.amount },
        });
    }
    async delete(id) {
        await this.prisma.goal.delete({ where: { id } });
    }
    toEntity(row) {
        const toNum = (v) => typeof v === 'object' && 'toNumber' in v ? v.toNumber() : Number(v);
        return goal_entity_1.Goal.reconstitute({
            id: row.id, userId: row.userId, name: row.name,
            type: row.type,
            targetAmount: money_vo_1.Money.of(toNum(row.targetAmount)),
            currentAmount: money_vo_1.Money.of(toNum(row.currentAmount)),
            deadline: row.deadline,
        });
    }
};
exports.PrismaGoalRepository = PrismaGoalRepository;
exports.PrismaGoalRepository = PrismaGoalRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaGoalRepository);
//# sourceMappingURL=prisma-goal.repository.js.map