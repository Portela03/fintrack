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
exports.PrismaUserRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../shared/infrastructure/prisma.service");
const user_entity_1 = require("../../domain/entities/user.entity");
let PrismaUserRepository = class PrismaUserRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.user.findUnique({ where: { id } });
        if (!row)
            return null;
        return user_entity_1.User.reconstitute(row);
    }
    async findByEmail(email) {
        const row = await this.prisma.user.findUnique({ where: { email } });
        if (!row)
            return null;
        return user_entity_1.User.reconstitute(row);
    }
    async save(user) {
        await this.prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                passwordHash: user.passwordHash,
            },
        });
    }
    async update(user) {
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                email: user.email,
                name: user.name,
                passwordHash: user.passwordHash,
            },
        });
    }
};
exports.PrismaUserRepository = PrismaUserRepository;
exports.PrismaUserRepository = PrismaUserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaUserRepository);
//# sourceMappingURL=prisma-user.repository.js.map