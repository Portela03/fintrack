"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiAssistantModule = void 0;
const common_1 = require("@nestjs/common");
const i_llm_port_1 = require("../application/ports/i-llm.port");
const gemini_adapter_1 = require("./adapters/gemini.adapter");
const ai_controller_1 = require("./http/ai.controller");
const send_message_use_case_1 = require("../application/use-cases/send-message/send-message.use-case");
const generate_insights_use_case_1 = require("../application/use-cases/generate-insights/generate-insights.use-case");
let AiAssistantModule = class AiAssistantModule {
};
exports.AiAssistantModule = AiAssistantModule;
exports.AiAssistantModule = AiAssistantModule = __decorate([
    (0, common_1.Module)({
        controllers: [ai_controller_1.AiController],
        providers: [
            gemini_adapter_1.GeminiAdapter,
            { provide: i_llm_port_1.CHAT_PORT, useExisting: gemini_adapter_1.GeminiAdapter },
            { provide: i_llm_port_1.CATEGORIZATION_PORT, useExisting: gemini_adapter_1.GeminiAdapter },
            { provide: i_llm_port_1.INSIGHT_PORT, useExisting: gemini_adapter_1.GeminiAdapter },
            send_message_use_case_1.SendMessageUseCase,
            generate_insights_use_case_1.GenerateInsightsUseCase,
        ],
        exports: [i_llm_port_1.CATEGORIZATION_PORT],
    })
], AiAssistantModule);
//# sourceMappingURL=ai-assistant.module.js.map