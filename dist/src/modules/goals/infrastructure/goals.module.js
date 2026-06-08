"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalsModule = void 0;
const common_1 = require("@nestjs/common");
const i_goal_repository_1 = require("../domain/repositories/i-goal.repository");
const prisma_goal_repository_1 = require("./repositories/prisma-goal.repository");
const goal_controller_1 = require("./http/goal.controller");
const create_goal_use_case_1 = require("../application/use-cases/create-goal.use-case");
let GoalsModule = class GoalsModule {
};
exports.GoalsModule = GoalsModule;
exports.GoalsModule = GoalsModule = __decorate([
    (0, common_1.Module)({
        controllers: [goal_controller_1.GoalController],
        providers: [
            { provide: i_goal_repository_1.GOAL_REPOSITORY, useClass: prisma_goal_repository_1.PrismaGoalRepository },
            create_goal_use_case_1.CreateGoalUseCase,
        ],
    })
], GoalsModule);
//# sourceMappingURL=goals.module.js.map