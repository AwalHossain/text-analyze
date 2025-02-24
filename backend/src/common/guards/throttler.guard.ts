/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(CustomThrottlerGuard.name);

  protected getTracker(req: Record<string, any>): Promise<string> {
    const ip = req.ip || req.connection?.remoteAddress || 'anonymous';

    const endpoint = req.route?.path || req.url;
    const tracker = `${ip}-${endpoint}-${req.method}`;

    this.logger.debug(`Rate limit tracker: ${tracker}`);
    return Promise.resolve(tracker);
  }

  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const { context, limit, ttl } = requestProps;
    const request = context.switchToHttp().getRequest();
    const tracker = await this.getTracker(request as Record<string, any>);

    this.logger.log(`Rate limit check:
      - Tracker: ${tracker}
      - Limit: ${limit}
      - TTL: ${ttl}
      - IP: ${request.ip}
      - Method: ${request.method}
      - Path: ${request.route?.path}`);

    try {
      const result = await super.handleRequest(requestProps);
      this.logger.debug(`Rate limit result: ${result ? 'allowed' : 'blocked'}`);
      return result;
    } catch (error) {
      this.logger.warn(`Rate limit exceeded for ${tracker}`);
      throw error;
    }
  }
}
