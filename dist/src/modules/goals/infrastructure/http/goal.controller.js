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
exports.GoalController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const common_2 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../identity/infrastructure/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../../identity/infrastructure/decorators/current-user.decorator");
const create_goal_use_case_1 = require("../../application/use-cases/create-goal.use-case");
const i_goal_repository_1 = require("../../domain/repositories/i-goal.repository");
let GoalController = class GoalController {
    createGoal;
    goalRepo;
    constructor(createGoal, goalRepo) {
        this.createGoal = createGoal;
        this.goalRepo = goalRepo;
    }
    async create(dto, user) {
        return this.createGoal.execute({ ...dto, userId: user.sub });
    }
    async list(user) {
        const goals = await this.goalRepo.findAllByUserId(user.sub);
        return goals.map((g) => ({
            id: g.id,
            name: g.name,
            type: g.type,
            targetAmount: g.targetAmount.amount,
            currentAmount: g.currentAmount.amount,
            progressPercentage: g.progressPercentage,
            deadline: g.deadline,
        }));
    }
};
exports.GoalController = GoalController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Criar meta financeira',
        description: 'Cria uma meta de economia (reserva de emergência, viagem, imóvel, veículo etc.). O progresso é calculado automaticamente conforme o `currentAmount` avança em relação ao `targetAmount`.',
    }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Meta criada. Retorna `{ id }`.' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Token JWT ausente ou inválido.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_goal_use_case_1.CreateGoalDto, Object]),
    __metadata("design:returntype", Promise)
], GoalController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Listar metas com progresso',
        description: 'Retorna todas as metas financeiras do usuário, incluindo `progressPercentage` (0–100) e `monthlySavingNeeded` calculados automaticamente.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Lista de metas com `id`, `name`, `type`, `targetAmount`, `currentAmount`, `progressPercentage`, `deadline`.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GoalController.prototype, "list", null);
exports.GoalController = GoalController = __decorate([
    (0, swagger_1.ApiTags)('5. Goals'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.Controller)('goals'),
    __param(1, (0, common_2.Inject)(i_goal_repository_1.GOAL_REPOSITORY)),
    __metadata("design:paramtypes", [create_goal_use_case_1.CreateGoalUseCase, Object])
], GoalController);
//# sourceMappingURL=goal.controller.js.map