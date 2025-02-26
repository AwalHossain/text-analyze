import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class TestThrottlerGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Allow all requests in test environment
    return true;
  }
} 