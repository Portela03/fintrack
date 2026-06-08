import { TokenPayload } from '../../../identity/application/ports/i-token-generator.port';
import { CreateConnectionUseCase } from '../../application/use-cases/create-connection/create-connection.use-case';
import { HandleWebhookUseCase } from '../../application/use-cases/handle-webhook/handle-webhook.use-case';
declare class CreateConnectionDto {
    itemId: string;
}
declare class WebhookPayloadDto {
    event: string;
    itemId: string;
}
export declare class ConnectionController {
    private readonly createConnection;
    private readonly handleWebhook;
    constructor(createConnection: CreateConnectionUseCase, handleWebhook: HandleWebhookUseCase);
    create(dto: CreateConnectionDto, user: TokenPayload): Promise<import("../../application/use-cases/create-connection/create-connection.use-case").CreateConnectionOutput>;
    webhook(payload: WebhookPayloadDto): Promise<{
        received: boolean;
    }>;
}
export {};
