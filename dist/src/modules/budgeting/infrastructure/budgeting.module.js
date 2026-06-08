"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetingModule = void 0;
const common_1 = require("@nestjs/common");
const i_budget_repository_1 = require("../domain/repositories/i-budget.repository");
const prisma_budget_repository_1 = require("./repositories/prisma-budget.repository");
const budget_controller_1 = require("./http/budget.controller");
const create_budget_use_case_1 = require("../application/use-cases/create-budget.use-case");
let BudgetingModule = class BudgetingModule {
};
exports.BudgetingModule = BudgetingModule;
exports.BudgetingModule = BudgetingModule = __decorate([
    (0, common_1.Module)({
        controllers: [budget_controller_1.BudgetController],
        providers: [
            { provide: i_budget_repository_1.BUDGET_REPOSITORY, useClass: prisma_budget_repository_1.PrismaBudgetRepository },
            create_budget_use_case_1.CreateBudgetUseCase,
        ],
    })
], BudgetingModule);
//# sourceMappingURL=budgeting.module.js.map