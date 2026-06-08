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
exports.CreateFinancingSimulationUseCase = exports.CreateSimulationDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const amortization_strategy_factory_1 = require("../../domain/strategies/amortization-strategy.factory");
const prisma_service_1 = require("../../../../shared/infrastructure/prisma.service");
const uuid_1 = require("uuid");
class CreateSimulationDto {
    name;
    propertyValue;
    downPayment;
    loanMonths;
    monthlyRate;
    amortizationType;
}
exports.CreateSimulationDto = CreateSimulationDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSimulationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSimulationDto.prototype, "propertyValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSimulationDto.prototype, "downPayment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSimulationDto.prototype, "loanMonths", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSimulationDto.prototype, "monthlyRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['SAC', 'PRICE'] }),
    (0, class_validator_1.IsEnum)(['SAC', 'PRICE']),
    __metadata("design:type", String)
], CreateSimulationDto.prototype, "amortizationType", void 0);
let CreateFinancingSimulationUseCase = class CreateFinancingSimulationUseCase {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async execute(input) {
        const loanAmount = input.propertyValue - input.downPayment;
        const strategy = amortization_strategy_factory_1.AmortizationStrategyFactory.create(input.amortizationType);
        const installments = strategy.calculate(loanAmount, input.monthlyRate / 100, input.loanMonths);
        const simId = (0, uuid_1.v4)();
        const totalPaid = installments.reduce((acc, i) => acc + i.totalPayment, 0);
        const totalInterest = installments.reduce((acc, i) => acc + i.interest, 0);
        await this.prisma.financingSimulation.create({
            data: {
                id: simId,
                userId: input.userId,
                name: input.name,
                propertyValue: input.propertyValue,
                downPayment: input.downPayment,
                loanMonths: input.loanMonths,
                monthlyRate: input.monthlyRate,
                amortizationType: input.amortizationType,
                installments: {
                    createMany: {
                        data: installments.map((i) => ({
                            id: (0, uuid_1.v4)(),
                            month: i.month,
                            principal: i.principal,
                            interest: i.interest,
                            totalPayment: i.totalPayment,
                            remainingBalance: i.remainingBalance,
                        })),
                    },
                },
            },
        });
        return {
            id: simId,
            summary: {
                loanAmount,
                firstInstallment: installments[0].totalPayment,
                lastInstallment: installments[installments.length - 1].totalPayment,
                totalPaid: Number(totalPaid.toFixed(2)),
                totalInterest: Number(totalInterest.toFixed(2)),
            },
        };
    }
};
exports.CreateFinancingSimulationUseCase = CreateFinancingSimulationUseCase;
exports.CreateFinancingSimulationUseCase = CreateFinancingSimulationUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateFinancingSimulationUseCase);
//# sourceMappingURL=create-financing-simulation.use-case.js.map