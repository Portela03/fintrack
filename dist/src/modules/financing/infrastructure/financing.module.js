"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancingModule = void 0;
const common_1 = require("@nestjs/common");
const financing_controller_1 = require("./http/financing.controller");
const create_financing_simulation_use_case_1 = require("../application/use-cases/create-financing-simulation.use-case");
const compare_financing_options_use_case_1 = require("../application/use-cases/compare-financing-options.use-case");
let FinancingModule = class FinancingModule {
};
exports.FinancingModule = FinancingModule;
exports.FinancingModule = FinancingModule = __decorate([
    (0, common_1.Module)({
        controllers: [financing_controller_1.FinancingController],
        providers: [create_financing_simulation_use_case_1.CreateFinancingSimulationUseCase, compare_financing_options_use_case_1.CompareFinancingOptionsUseCase],
    })
], FinancingModule);
//# sourceMappingURL=financing.module.js.map