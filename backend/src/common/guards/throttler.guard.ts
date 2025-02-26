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

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.limit = this.configService.get<number>('THROTTLE_LIMIT', 10);
    this.ttl = this.configService.get<number>('THROTTLE_TTL', 60000);
    this.penaltyMs = 10000; // Fixed 10 seconds penalty
    this.logger.log(`Rate limiter initialized with limit: ${this.limit}, ttl: ${this.ttl}ms`);
    
    // Run cleanup every 30 seconds
    setInterval(() => this.cleanup(), 30000);
  }
 
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || 'anonymous';
    this.logger.log(`Client IP: ${ip}`);

    const now = Date.now();
    let record = this.ipHitMap.get(ip);

    // Clear expired records
    if (record?.blockedUntil && record.blockedUntil < now) {
        // If block time has expired, remove the record completely
        this.ipHitMap.delete(ip);
        record = undefined;
    }

    if (record?.resetTime && record.resetTime < now) {
        // If TTL has expired, remove the record completely
        this.ipHitMap.delete(ip);
        record = undefined;
    }

    // If no record exists, create a new one
    if (!record) {
        this.ipHitMap.set(ip, {
            hits: 1,
            resetTime: now + this.ttl,
        });
        this.logger.log(`Request count for ${ip}: 1/${this.limit}`);
        return true;
    }

    // Check if user is in penalty box
    if (record.blockedUntil) {
        const remainingBlockMs = Math.ceil((record.blockedUntil - now) / 1000);
        this.logger.warn(
            `IP ${ip} is blocked for ${remainingBlockMs} more seconds`,
        );
        throw new ThrottlerException(
            `Too many requests. Try again in ${remainingBlockMs} seconds.`,
        );
    }

    // Increment hits
    record.hits += 1;
    this.logger.log(`Request count for ${ip}: ${record.hits}/${this.limit}`);

    // Check if limit is exceeded
    if (record.hits > this.limit) {
        // Set block time for 10 seconds from now
        record.blockedUntil = now + 10000; // 10 seconds in milliseconds
        this.logger.warn(
            `Rate limit exceeded for ${ip}: ${record.hits}/${this.limit}. Blocked until: ${new Date(record.blockedUntil).toLocaleString()}`,
        );
        throw new ThrottlerException(
            `Too many requests. Try again in 10 seconds.`,
        );
    }

    return true;
  }

  // Add cleanup method
  private cleanup() {
    const now = Date.now();
    for (const [ip, record] of this.ipHitMap.entries()) {
        if ((record.resetTime < now) || (record.blockedUntil && record.blockedUntil < now)) {
            this.ipHitMap.delete(ip);
        }
    }
  }
}
