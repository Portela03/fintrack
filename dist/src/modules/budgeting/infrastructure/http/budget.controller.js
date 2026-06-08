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
exports.BudgetController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../identity/infrastructure/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../../identity/infrastructure/decorators/current-user.decorator");
const create_budget_use_case_1 = require("../../application/use-cases/create-budget.use-case");
const common_2 = require("@nestjs/common");
const i_budget_repository_1 = require("../../domain/repositories/i-budget.repository");
let BudgetController = class BudgetController {
    createBudget;
    budgetRepo;
    constructor(createBudget, budgetRepo) {
        this.createBudget = createBudget;
        this.budgetRepo = budgetRepo;
    }
    async create(dto, user) {
        return this.createBudget.execute({ ...dto, userId: user.sub });
    }
    async list(user) {
        return this.budgetRepo.findAllByUserId(user.sub);
    }
    async remove(id) {
        await this.budgetRepo.delete(id);
        return { deleted: true };
    }
};
exports.BudgetController = BudgetController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Criar orçamento por categoria',
        description: 'Define um limite de gastos para uma categoria em um período (mensal, semanal ou anual). Útil para controle de gastos com alimentação, transporte, lazer etc.',
    }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Orçamento criado. Retorna `{ id }`.' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Token JWT ausente ou inválido.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_budget_use_case_1.CreateBudgetDto, Object]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Listar orçamentos',
        description: 'Retorna todos os orçamentos configurados pelo usuário.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Lista de orçamentos.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "list", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Excluir orçamento',
        description: 'Remove permanentemente um orçamento pelo ID.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do orçamento' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Orçamento excluído. Retorna `{ deleted: true }`.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "remove", null);
exports.BudgetController = BudgetController = __decorate([
    (0, swagger_1.ApiTags)('4. Budgeting'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.Controller)('budgets'),
    __param(1, (0, common_2.Inject)(i_budget_repository_1.BUDGET_REPOSITORY)),
    __metadata("design:paramtypes", [create_budget_use_case_1.CreateBudgetUseCase, Object])
], BudgetController);
//# sourceMappingURL=budget.controller.js.map