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
exports.GenerateInsightsUseCase = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../shared/infrastructure/prisma.service");
const i_llm_port_1 = require("../../ports/i-llm.port");
const dayjs_1 = __importDefault(require("dayjs"));
let GenerateInsightsUseCase = class GenerateInsightsUseCase {
    insightPort;
    prisma;
    constructor(insightPort, prisma) {
        this.insightPort = insightPort;
        this.prisma = prisma;
    }
    async execute(input) {
        const from = (0, dayjs_1.default)().startOf('month').toDate();
        const to = (0, dayjs_1.default)().endOf('month').toDate();
        const transactions = await this.prisma.transaction.findMany({
            where: { userId: input.userId, date: { gte: from, lte: to }, type: 'DEBIT' },
            select: { amount: true, description: true, categoryId: true },
        });
        const totalSpent = transactions
            .reduce((acc, t) => acc + Number(t.amount), 0)
            .toFixed(2);
        const categoryGroups = transactions.reduce((acc, t) => {
            const key = t.categoryId ?? 'Sem categoria';
            acc[key] = (acc[key] ?? 0) + Number(t.amount);
            return acc;
        }, {});
        const summary = `
Período: ${(0, dayjs_1.default)(from).format('DD/MM/YYYY')} a ${(0, dayjs_1.default)(to).format('DD/MM/YYYY')}
Total gasto: R$ ${totalSpent}
Número de transações: ${transactions.length}
Gastos por categoria:
${Object.entries(categoryGroups)
            .sort(([, a], [, b]) => b - a)
            .map(([k, v]) => `  - ${k}: R$ ${v.toFixed(2)}`)
            .join('\n')}
`;
        const insights = await this.insightPort.generateInsights(summary);
        return { insights };
    }
};
exports.GenerateInsightsUseCase = GenerateInsightsUseCase;
exports.GenerateInsightsUseCase = GenerateInsightsUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(i_llm_port_1.INSIGHT_PORT)),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService])
], GenerateInsightsUseCase);
//# sourceMappingURL=generate-insights.use-case.js.map