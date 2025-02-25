import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly requestCache: Map<
    string,
    { count: number; timestamp: number }
  > = new Map();
  private readonly limit: number;
  private readonly ttl: number;

  constructor(private readonly configService: ConfigService) {
    this.limit = this.configService.get<number>('THROTTLE_LIMIT', 10);
    this.ttl = this.configService.get<number>('THROTTLE_TTL', 60000);
    this.logger.log(`Rate limiter initialized with limit: ${this.limit}, ttl: ${this.ttl}ms`);
  }

  async isRateLimited(deviceId: string): Promise<boolean> {
    const currentTime = Date.now();
    const cachedData = this.requestCache.get(deviceId);

    this.logger.log(`Checking rate limit for device: ${deviceId}`);

    if (cachedData) {
      const timeDiff = currentTime - cachedData.timestamp;

      // If within time window
      if (timeDiff < this.ttl) {
        this.logger.log(
          `Request count for device ${deviceId}: ${cachedData.count + 1}/${this.limit}`,
        );

        // Check if limit exceeded
        if (cachedData.count >= this.limit) {
          this.logger.warn(
            `Rate limit exceeded for device ${deviceId}: ${cachedData.count}/${this.limit}`,
          );
          return true;
        } else {
          cachedData.count++;
          return false;
        }
      } else {
        // Time window expired, reset counter
        this.requestCache.set(deviceId, { count: 1, timestamp: currentTime });
        this.logger.log(
          `Reset request count for device ${deviceId}: 1/${this.limit}`,
        );
        return false;
      }
    } else {
      // First request from this device
      this.requestCache.set(deviceId, { count: 1, timestamp: currentTime });
      this.logger.log(`First request from device ${deviceId}: 1/${this.limit}`);
      return false;
    }
  }
}
