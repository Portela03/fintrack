"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankingModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const i_connection_repository_1 = require("../domain/repositories/i-connection.repository");
const i_pluggy_port_1 = require("../application/ports/i-pluggy.port");
const prisma_connection_repository_1 = require("./repositories/prisma-connection.repository");
const pluggy_adapter_1 = require("./adapters/pluggy.adapter");
const sync_processor_1 = require("./processors/sync.processor");
const connection_controller_1 = require("./http/connection.controller");
const create_connection_use_case_1 = require("../application/use-cases/create-connection/create-connection.use-case");
const handle_webhook_use_case_1 = require("../application/use-cases/handle-webhook/handle-webhook.use-case");
const queue_constants_1 = require("../../../shared/infrastructure/queue/queue.constants");
let BankingModule = class BankingModule {
};
exports.BankingModule = BankingModule;
exports.BankingModule = BankingModule = __decorate([
    (0, common_1.Module)({
        imports: [bullmq_1.BullModule.registerQueue({ name: queue_constants_1.QUEUE_NAMES.SYNC })],
        controllers: [connection_controller_1.ConnectionController],
        providers: [
            { provide: i_connection_repository_1.CONNECTION_REPOSITORY, useClass: prisma_connection_repository_1.PrismaConnectionRepository },
            { provide: i_pluggy_port_1.PLUGGY_CONNECTION_PORT, useClass: pluggy_adapter_1.PluggyAdapter },
            { provide: i_pluggy_port_1.PLUGGY_DATA_PORT, useClass: pluggy_adapter_1.PluggyAdapter },
            sync_processor_1.SyncProcessor,
            create_connection_use_case_1.CreateConnectionUseCase,
            handle_webhook_use_case_1.HandleWebhookUseCase,
        ],
        exports: [i_pluggy_port_1.PLUGGY_DATA_PORT, i_connection_repository_1.CONNECTION_REPOSITORY],
    })
], BankingModule);
//# sourceMappingURL=banking.module.js.map