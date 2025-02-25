import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerException } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard implements CanActivate {
  private readonly logger = new Logger(CustomThrottlerGuard.name);
  // Simple in-memory storage
  private readonly ipHitMap: Map<
    string,
    { hits: number; resetTime: number; blockedUntil?: number }
  > = new Map();
  private readonly limit: number;
  private readonly ttl: number;
  private readonly penaltyMs: number;

  constructor(private readonly configService: ConfigService) {
    this.limit = this.configService.get<number>('THROTTLE_LIMIT', 10);
    this.ttl = this.configService.get<number>('THROTTLE_TTL', 60000);
    this.penaltyMs = this.configService.get<number>('PENALTY_TTL', 10000);
    this.logger.log(`Rate limiter initialized with limit: ${this.limit}, ttl: ${this.ttl}ms`);
  }
 
  canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || 'anonymous';
    this.logger.log(`Client IP: ${ip}`);

    const now = Date.now();
    const record = this.ipHitMap.get(ip);

    // Check if user is in penalty box
    if (record?.blockedUntil && record.blockedUntil > now) {
      const remainingBlockMs = Math.ceil((record.blockedUntil - now) / 1000);
      this.logger.warn(
        `IP ${ip} is blocked for ${remainingBlockMs} more seconds`,
      );
      throw new ThrottlerException(
        `Too many requests. Try again in ${remainingBlockMs} seconds.`,
      );
    }

    // If no record exists or the record has expired, create a new one
    if (!record || record.resetTime < now) {
      this.ipHitMap.set(ip, {
        hits: 1,
        resetTime: now + this.ttl,
      });
      this.logger.log(`Request count for ${ip}: 1/${this.limit}`);
      return Promise.resolve(true);
    }

    // Increment hit count
    record.hits += 1;
    this.logger.log(`Request count for ${ip}: ${record.hits}/${this.limit}`);

    // Check if limit is exceeded
    if (record.hits > this.limit) {
      // Add to penalty box
      record.blockedUntil = now + this.penaltyMs;
      this.logger.warn(
        `Rate limit exceeded for ${ip}: ${record.hits}/${this.limit}. Blocked until: ${new Date(record.blockedUntil).toISOString()}`,
      );
      throw new ThrottlerException(
        `Too many requests. Try again in ${this.penaltyMs / 1000} seconds.`,
      );
    }

    return Promise.resolve(true);
  }
}
