import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import type { Request } from 'express';

@Injectable()
export class PluggyWebhookGuard implements CanActivate {
  private readonly logger = new Logger(PluggyWebhookGuard.name);

  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const secret = this.config.get<string>('PLUGGY_WEBHOOK_SECRET');
    if (!secret) {
      this.logger.warn('PLUGGY_WEBHOOK_SECRET not configured — skipping HMAC validation');
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const signature = req.headers['x-pluggy-signature'] as string | undefined;

    if (!signature) {
      throw new UnauthorizedException('Missing x-pluggy-signature header');
    }

    const rawBody: Buffer | undefined = (req as unknown as { rawBody?: Buffer }).rawBody;
    const bodyStr = rawBody ? rawBody.toString('utf8') : JSON.stringify(req.body);
    const expected = createHmac('sha256', secret).update(bodyStr).digest('hex');

    let received: string;
    try {
      // Pluggy may send "sha256=<hash>" or just "<hash>"
      received = signature.startsWith('sha256=') ? signature.slice(7) : signature;
    } catch {
      throw new UnauthorizedException('Invalid x-pluggy-signature format');
    }

    const expectedBuf = Buffer.from(expected, 'hex');
    const receivedBuf = Buffer.from(received, 'hex');

    if (
      expectedBuf.length !== receivedBuf.length ||
      !timingSafeEqual(expectedBuf, receivedBuf)
    ) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }
}
