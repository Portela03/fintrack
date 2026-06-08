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
exports.FinancingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../identity/infrastructure/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../../identity/infrastructure/decorators/current-user.decorator");
const create_financing_simulation_use_case_1 = require("../../application/use-cases/create-financing-simulation.use-case");
const compare_financing_options_use_case_1 = require("../../application/use-cases/compare-financing-options.use-case");
const prisma_service_1 = require("../../../../shared/infrastructure/prisma.service");
class CompareDto {
    loanAmount;
    monthlyRate;
    months;
}
__decorate([
    (0, swagger_2.ApiProperty)({ description: 'Valor total do financiamento (sem entrada)', example: 300000 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CompareDto.prototype, "loanAmount", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ description: 'Taxa de juros mensal em decimal (ex: 0.8 para 0,8% a.m.)', example: 0.8 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CompareDto.prototype, "monthlyRate", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ description: 'Prazo em meses', example: 360 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CompareDto.prototype, "months", void 0);
let FinancingController = class FinancingController {
    createSimulation;
    compareOptions;
    prisma;
    constructor(createSimulation, compareOptions, prisma) {
        this.createSimulation = createSimulation;
        this.compareOptions = compareOptions;
        this.prisma = prisma;
    }
    async create(dto, user) {
        return this.createSimulation.execute({ ...dto, userId: user.sub });
    }
    async list(user) {
        return this.prisma.financingSimulation.findMany({
            where: { userId: user.sub },
            select: {
                id: true, name: true, propertyValue: true, downPayment: true,
                loanMonths: true, monthlyRate: true, amortizationType: true, createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getInstallments(id) {
        return this.prisma.financingInstallment.findMany({
            where: { simulationId: id },
            orderBy: { month: 'asc' },
        });
    }
    async compare(dto) {
        return this.compareOptions.execute(dto);
    }
};
exports.FinancingController = FinancingController;
__decorate([
    (0, common_1.Post)('simulations'),
    (0, swagger_1.ApiOperation)({
        summary: 'Criar simulação de financiamento',
        description: 'Simula um financiamento imobiliário usando tabela SAC ou PRICE. Persiste a simulação e todas as parcelas no banco. SAC: parcela decrescente, juros altos no início. PRICE: parcela fixa, mais juros no total.',
    }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Simulação criada. Retorna `id` e resumo financeiro (total pago, total de juros).' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_financing_simulation_use_case_1.CreateSimulationDto, Object]),
    __metadata("design:returntype", Promise)
], FinancingController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('simulations'),
    (0, swagger_1.ApiOperation)({
        summary: 'Listar simulações',
        description: 'Retorna todas as simulações de financiamento do usuário, ordenadas por data de criação (mais recente primeiro).',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Lista de simulações com metadados.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinancingController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('simulations/:id/installments'),
    (0, swagger_1.ApiOperation)({
        summary: 'Ver parcelas de uma simulação',
        description: 'Retorna todas as parcelas de uma simulação, ordenadas por mês. Cada parcela contém: `month`, `totalPayment`, `principal`, `interest`, `remainingBalance`.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID da simulação' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Lista de parcelas ordenadas por mês.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinancingController.prototype, "getInstallments", null);
__decorate([
    (0, common_1.Post)('compare'),
    (0, swagger_1.ApiOperation)({
        summary: 'Comparar SAC vs PRICE',
        description: 'Compara os dois sistemas de amortização para os mesmos parâmetros, sem persistir no banco. Retorna totais pagos, total de juros e uma recomendação baseada no custo total.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Comparativo com recomendação entre SAC e PRICE.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CompareDto]),
    __metadata("design:returntype", Promise)
], FinancingController.prototype, "compare", null);
exports.FinancingController = FinancingController = __decorate([
    (0, swagger_1.ApiTags)('6. Financing'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.Controller)('financing'),
    __metadata("design:paramtypes", [create_financing_simulation_use_case_1.CreateFinancingSimulationUseCase,
        compare_financing_options_use_case_1.CompareFinancingOptionsUseCase,
        prisma_service_1.PrismaService])
], FinancingController);
//# sourceMappingURL=financing.controller.js.map