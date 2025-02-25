import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Request } from 'express';
import { RateLimiterService } from '../services/rate-limiter.service';

@Injectable()
export class DeviceThrottlerGuard implements CanActivate {
  private readonly logger = new Logger(DeviceThrottlerGuard.name);

  constructor(private readonly rateLimiterService: RateLimiterService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    // Get device ID from headers
    const deviceIdHeader = request.headers['device-id'];
    this.logger.log(`Device ID header: ${deviceIdHeader}`);
    const deviceId =
      typeof deviceIdHeader === 'string'
        ? deviceIdHeader
        : request.ip || 'anonymous';
    this.logger.log(`Request from device: ${deviceId}`);

    // Check if rate limited
    const isLimited = await this.rateLimiterService.isRateLimited(deviceId);

    if (isLimited) {
      throw new ThrottlerException('Too Many Requests');
    }

    return true;
  }
}
