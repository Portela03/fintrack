"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const prisma_module_1 = require("./shared/infrastructure/prisma.module");
const queue_module_1 = require("./shared/infrastructure/queue/queue.module");
const identity_module_1 = require("./modules/identity/infrastructure/identity.module");
const banking_module_1 = require("./modules/banking/infrastructure/banking.module");
const financial_module_1 = require("./modules/financial/infrastructure/financial.module");
const budgeting_module_1 = require("./modules/budgeting/infrastructure/budgeting.module");
const goals_module_1 = require("./modules/goals/infrastructure/goals.module");
const financing_module_1 = require("./modules/financing/infrastructure/financing.module");
const ai_assistant_module_1 = require("./modules/ai-assistant/infrastructure/ai-assistant.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            event_emitter_1.EventEmitterModule.forRoot(),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            queue_module_1.QueueModule,
            identity_module_1.IdentityModule,
            banking_module_1.BankingModule,
            financial_module_1.FinancialModule,
            budgeting_module_1.BudgetingModule,
            goals_module_1.GoalsModule,
            financing_module_1.FinancingModule,
            ai_assistant_module_1.AiAssistantModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map