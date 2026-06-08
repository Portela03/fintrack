"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SyncProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncProcessor = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const queue_constants_1 = require("../../../../shared/infrastructure/queue/queue.constants");
let SyncProcessor = SyncProcessor_1 = class SyncProcessor extends bullmq_1.WorkerHost {
    logger = new common_1.Logger(SyncProcessor_1.name);
    async process(job) {
        this.logger.log(`Processing job: ${job.name} for item ${job.data.itemId}`);
        switch (job.name) {
            case queue_constants_1.SYNC_JOBS.SYNC_ACCOUNTS:
                await this.handleSyncAccounts(job.data);
                break;
            case queue_constants_1.SYNC_JOBS.SYNC_TRANSACTIONS:
                await this.handleSyncTransactions(job.data);
                break;
            case queue_constants_1.SYNC_JOBS.SYNC_INVESTMENTS:
                await this.handleSyncInvestments(job.data);
                break;
            default:
                this.logger.warn(`Unknown job: ${job.name}`);
        }
    }
    async handleSyncAccounts(data) {
        this.logger.log(`Sync accounts for connection ${data.connectionId}`);
    }
    async handleSyncTransactions(data) {
        this.logger.log(`Sync transactions for connection ${data.connectionId}`);
    }
    async handleSyncInvestments(data) {
        this.logger.log(`Sync investments for connection ${data.connectionId}`);
    }
};
exports.SyncProcessor = SyncProcessor;
exports.SyncProcessor = SyncProcessor = SyncProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(queue_constants_1.QUEUE_NAMES.SYNC),
    (0, common_1.Injectable)()
], SyncProcessor);
//# sourceMappingURL=sync.processor.js.map