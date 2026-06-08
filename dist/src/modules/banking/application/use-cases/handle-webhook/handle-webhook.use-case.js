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
var HandleWebhookUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandleWebhookUseCase = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const i_connection_repository_1 = require("../../../domain/repositories/i-connection.repository");
const queue_constants_1 = require("../../../../../shared/infrastructure/queue/queue.constants");
let HandleWebhookUseCase = HandleWebhookUseCase_1 = class HandleWebhookUseCase {
    connectionRepo;
    syncQueue;
    logger = new common_1.Logger(HandleWebhookUseCase_1.name);
    constructor(connectionRepo, syncQueue) {
        this.connectionRepo = connectionRepo;
        this.syncQueue = syncQueue;
    }
    async execute(input) {
        const connection = await this.connectionRepo.findByItemId(input.itemId);
        if (!connection) {
            this.logger.warn(`Webhook for unknown itemId: ${input.itemId}`);
            return;
        }
        if (input.event === 'item/updated' || input.event === 'item/created') {
            await this.syncQueue.add(queue_constants_1.SYNC_JOBS.SYNC_TRANSACTIONS, {
                connectionId: connection.id,
                itemId: input.itemId,
                userId: connection.userId,
            });
        }
    }
};
exports.HandleWebhookUseCase = HandleWebhookUseCase;
exports.HandleWebhookUseCase = HandleWebhookUseCase = HandleWebhookUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(i_connection_repository_1.CONNECTION_REPOSITORY)),
    __param(1, (0, bullmq_1.InjectQueue)(queue_constants_1.QUEUE_NAMES.SYNC)),
    __metadata("design:paramtypes", [Object, bullmq_2.Queue])
], HandleWebhookUseCase);
//# sourceMappingURL=handle-webhook.use-case.js.map