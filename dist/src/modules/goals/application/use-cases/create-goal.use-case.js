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
exports.CreateGoalUseCase = exports.CreateGoalDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const goal_entity_1 = require("../../domain/entities/goal.entity");
const money_vo_1 = require("../../../financial/domain/value-objects/money.vo");
const i_goal_repository_1 = require("../../domain/repositories/i-goal.repository");
class CreateGoalDto {
    name;
    type;
    targetAmount;
    deadline;
}
exports.CreateGoalDto = CreateGoalDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGoalDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['EMERGENCY_FUND', 'TRAVEL', 'PROPERTY', 'VEHICLE', 'OTHER'] }),
    (0, class_validator_1.IsEnum)(['EMERGENCY_FUND', 'TRAVEL', 'PROPERTY', 'VEHICLE', 'OTHER']),
    __metadata("design:type", String)
], CreateGoalDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateGoalDto.prototype, "targetAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateGoalDto.prototype, "deadline", void 0);
let CreateGoalUseCase = class CreateGoalUseCase {
    goalRepo;
    constructor(goalRepo) {
        this.goalRepo = goalRepo;
    }
    async execute(input) {
        const targetOrErr = money_vo_1.Money.create(input.targetAmount);
        if (targetOrErr.isLeft())
            throw targetOrErr.value;
        const goal = goal_entity_1.Goal.create({
            userId: input.userId,
            name: input.name,
            type: input.type,
            targetAmount: targetOrErr.value,
            currentAmount: money_vo_1.Money.of(0),
            deadline: input.deadline ? new Date(input.deadline) : null,
        });
        await this.goalRepo.save(goal);
        return { id: goal.id };
    }
};
exports.CreateGoalUseCase = CreateGoalUseCase;
exports.CreateGoalUseCase = CreateGoalUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(i_goal_repository_1.GOAL_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], CreateGoalUseCase);
//# sourceMappingURL=create-goal.use-case.js.map