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
exports.CreateConnectionUseCase = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const i_pluggy_port_1 = require("../../ports/i-pluggy.port");
const i_connection_repository_1 = require("../../../domain/repositories/i-connection.repository");
const pluggy_connection_entity_1 = require("../../../domain/entities/pluggy-connection.entity");
const queue_constants_1 = require("../../../../../shared/infrastructure/queue/queue.constants");
let CreateConnectionUseCase = class CreateConnectionUseCase {
    pluggyPort;
    connectionRepo;
    syncQueue;
    constructor(pluggyPort, connectionRepo, syncQueue) {
        this.pluggyPort = pluggyPort;
        this.connectionRepo = connectionRepo;
        this.syncQueue = syncQueue;
    }
    async execute(input) {
        const connectToken = await this.pluggyPort.createConnectToken(input.userId);
        const connection = pluggy_connection_entity_1.PluggyConnection.create({
            userId: input.userId,
            itemId: input.itemId,
        });
        await this.connectionRepo.save(connection);
        await this.syncQueue.add(queue_constants_1.SYNC_JOBS.SYNC_ACCOUNTS, { connectionId: connection.id, itemId: input.itemId, userId: input.userId }, { delay: 2000 });
        return { connectToken, connectionId: connection.id };
    }
};
exports.CreateConnectionUseCase = CreateConnectionUseCase;
exports.CreateConnectionUseCase = CreateConnectionUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(i_pluggy_port_1.PLUGGY_CONNECTION_PORT)),
    __param(1, (0, common_1.Inject)(i_connection_repository_1.CONNECTION_REPOSITORY)),
    __param(2, (0, bullmq_1.InjectQueue)(queue_constants_1.QUEUE_NAMES.SYNC)),
    __metadata("design:paramtypes", [Object, Object, bullmq_2.Queue])
], CreateConnectionUseCase);
//# sourceMappingURL=create-connection.use-case.js.map