import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerException } from '@nestjs/throttler';

interface ThrottleRecord {
  hits: number;
  windowStart: number;
  blockedUntil?: number;
}

@Injectable()
export class CustomThrottlerGuard implements CanActivate {
  private readonly logger = new Logger(CustomThrottlerGuard.name);
  private readonly ipHitMap: Map<string, ThrottleRecord> = new Map();
  private readonly limit: number;
  private readonly ttl: number;
  private readonly penaltyMs: number;
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.limit = this.configService.get<number>('THROTTLE_LIMIT', 10);
    this.ttl = this.configService.get<number>('THROTTLE_TTL', 60000);
    this.penaltyMs = 10000; // Fixed 10 seconds penalty
    this.logger.log(`Rate limiter initialized with limit: ${this.limit}, ttl: ${this.ttl}ms`);
    
    // Run cleanup every 30 seconds
    this.cleanupInterval = setInterval(() => this.cleanup(), 30000);
  }

  private getRecord(ip: string): { record: ThrottleRecord; isNew: boolean } {
    const now = Date.now();
    let record = this.ipHitMap.get(ip);
    let isNew = false;

    // Check if record exists and if the time window has expired
    if (record) {
      const windowExpired = (now - record.windowStart) >= this.ttl;
      if (windowExpired) {
        this.logger.log(`Time window expired for ${ip}, resetting count`);
        this.ipHitMap.delete(ip);
        record = undefined;
      } else if (record.blockedUntil && record.blockedUntil < now) {
        this.logger.log(`Block time expired for ${ip}, removing block`);
        this.ipHitMap.delete(ip);
        record = undefined;
      }
    }

    if (!record) {
      record = {
        hits: 0,
        windowStart: now,
      };
      isNew = true;
      this.logger.log(`New rate limit window for ${ip}`);
    }

    return { record, isNew };
  }
 
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const ip = request.ip || 'anonymous';
      
      const { record, isNew } = this.getRecord(ip);
      const now = Date.now();

      // Check if user is in penalty box
      if (record.blockedUntil) {
        const remainingBlockMs = Math.ceil((record.blockedUntil - now) / 1000);
        if (remainingBlockMs > 0) {
          this.logger.warn(`IP ${ip} is blocked for ${remainingBlockMs} seconds`);
          throw new ThrottlerException(
            `Too many requests. Try again in ${remainingBlockMs} seconds.`
          );
        }
      }

      // Increment hits
      record.hits += 1;

      // If new record or existing record, ensure it's in the map
      this.ipHitMap.set(ip, record);

      const timeUntilReset = Math.max(0, Math.ceil((this.ttl - (now - record.windowStart)) / 1000));
      
      this.logger.log(
        `Request count for ${ip}: ${record.hits}/${this.limit}, ` +
        `window resets in ${timeUntilReset} seconds`
      );

      // Check if limit is exceeded
      if (record.hits > this.limit) {
        record.blockedUntil = now + this.penaltyMs;
        const blockSeconds = Math.ceil(this.penaltyMs / 1000);
        this.logger.warn(
          `Rate limit exceeded for ${ip}: ${record.hits}/${this.limit}. ` +
          `Blocked for ${blockSeconds} seconds`
        );
        throw new ThrottlerException(
          `Too many requests. Try again in ${blockSeconds} seconds.`
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ThrottlerException) {
        throw error;
      }
      this.logger.error(`Error in throttler guard: ${error.message}`);
      // On error, allow the request to prevent blocking legitimate traffic
      return true;
    }
  }

  private cleanup() {
    try {
      const now = Date.now();
      let cleaned = 0;
      
      // Use for...of instead of entries() to prevent iterator allocation
      for (const [ip, record] of this.ipHitMap) {
        const windowExpired = (now - record.windowStart) >= this.ttl;
        if (windowExpired || (record.blockedUntil && record.blockedUntil < now)) {
          this.ipHitMap.delete(ip);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        this.logger.debug(`Cleaned up ${cleaned} expired records`);
      }
    } catch (error) {
      this.logger.error(`Error in cleanup: ${error.message}`);
    }
  }
}
