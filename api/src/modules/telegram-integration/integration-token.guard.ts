import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';

@Injectable()
export class IntegrationTokenGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get<string>('TELEGRAM_INTEGRATION_TOKEN');
    const received = context.switchToHttp().getRequest().headers['x-integration-token'];

    if (!expected || typeof received !== 'string') {
      throw new UnauthorizedException('Integration authentication failed');
    }

    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(received);
    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      throw new UnauthorizedException('Integration authentication failed');
    }

    return true;
  }
}
