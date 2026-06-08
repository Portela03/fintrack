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
exports.PrismaConnectionRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../shared/infrastructure/prisma.service");
const pluggy_connection_entity_1 = require("../../domain/entities/pluggy-connection.entity");
let PrismaConnectionRepository = class PrismaConnectionRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.pluggyConnection.findUnique({ where: { id } });
        if (!row)
            return null;
        return pluggy_connection_entity_1.PluggyConnection.reconstitute(row);
    }
    async findByItemId(itemId) {
        const row = await this.prisma.pluggyConnection.findUnique({ where: { itemId } });
        if (!row)
            return null;
        return pluggy_connection_entity_1.PluggyConnection.reconstitute(row);
    }
    async findAllByUserId(userId) {
        const rows = await this.prisma.pluggyConnection.findMany({ where: { userId } });
        return rows.map((r) => pluggy_connection_entity_1.PluggyConnection.reconstitute(r));
    }
    async save(connection) {
        await this.prisma.pluggyConnection.create({
            data: {
                id: connection.id,
                userId: connection.userId,
                itemId: connection.itemId,
                status: connection.status,
                lastSyncAt: connection.lastSyncAt,
            },
        });
    }
    async update(connection) {
        await this.prisma.pluggyConnection.update({
            where: { id: connection.id },
            data: {
                status: connection.status,
                lastSyncAt: connection.lastSyncAt,
            },
        });
    }
};
exports.PrismaConnectionRepository = PrismaConnectionRepository;
exports.PrismaConnectionRepository = PrismaConnectionRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaConnectionRepository);
//# sourceMappingURL=prisma-connection.repository.js.map