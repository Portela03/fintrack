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
exports.ConnectionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../identity/infrastructure/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../../identity/infrastructure/decorators/current-user.decorator");
const create_connection_use_case_1 = require("../../application/use-cases/create-connection/create-connection.use-case");
const handle_webhook_use_case_1 = require("../../application/use-cases/handle-webhook/handle-webhook.use-case");
class CreateConnectionDto {
    itemId;
}
__decorate([
    (0, swagger_2.ApiProperty)({ description: 'ID do item retornado pelo widget do Pluggy', example: 'abc123' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateConnectionDto.prototype, "itemId", void 0);
class WebhookPayloadDto {
    event;
    itemId;
}
__decorate([
    (0, swagger_2.ApiProperty)({ example: 'item/updated' }),
    __metadata("design:type", String)
], WebhookPayloadDto.prototype, "event", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ example: 'abc123' }),
    __metadata("design:type", String)
], WebhookPayloadDto.prototype, "itemId", void 0);
let ConnectionController = class ConnectionController {
    createConnection;
    handleWebhook;
    constructor(createConnection, handleWebhook) {
        this.createConnection = createConnection;
        this.handleWebhook = handleWebhook;
    }
    async create(dto, user) {
        return this.createConnection.execute({
            userId: user.sub,
            itemId: dto.itemId,
        });
    }
    async webhook(payload) {
        await this.handleWebhook.execute({
            event: payload.event,
            itemId: payload.itemId,
        });
        return { received: true };
    }
};
exports.ConnectionController = ConnectionController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Criar conexão bancária',
        description: 'Registra uma conexão com uma instituição financeira via Pluggy (Open Finance). Após criar a conexão, dispara uma sincronização assíncrona de contas e transações via fila BullMQ. O `itemId` é obtido após o usuário autorizar o acesso pelo widget do Pluggy.',
    }),
    (0, swagger_1.ApiBody)({ type: CreateConnectionDto }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Conexão criada. Sincronização iniciada em background.' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Token JWT ausente ou inválido.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateConnectionDto, Object]),
    __metadata("design:returntype", Promise)
], ConnectionController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Receber eventos do Pluggy (webhook)',
        description: 'Endpoint chamado automaticamente pelo Pluggy quando dados bancários são atualizados. No evento `item/updated`, dispara re-sincronização de transações. Não requer autenticação JWT (autenticado via assinatura HMAC do Pluggy).',
    }),
    (0, swagger_1.ApiBody)({ type: WebhookPayloadDto }),
    (0, swagger_1.ApiOkResponse)({ description: 'Evento recebido. Retorna `{ received: true }`.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WebhookPayloadDto]),
    __metadata("design:returntype", Promise)
], ConnectionController.prototype, "webhook", null);
exports.ConnectionController = ConnectionController = __decorate([
    (0, swagger_1.ApiTags)('2. Banking (Pluggy)'),
    (0, common_1.Controller)('connections'),
    __metadata("design:paramtypes", [create_connection_use_case_1.CreateConnectionUseCase,
        handle_webhook_use_case_1.HandleWebhookUseCase])
], ConnectionController);
//# sourceMappingURL=connection.controller.js.map