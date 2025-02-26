import { Module } from '@nestjs/common';
import { DeviceThrottlerGuard } from './guards/device-throttler.guard';
import { RateLimiterService } from './services/rate-limiter.service';
import { TextUtils } from './utils/text-analysis.utils';

@Module({
  providers: [TextUtils, RateLimiterService, DeviceThrottlerGuard],
  exports: [TextUtils, RateLimiterService, DeviceThrottlerGuard],
})
export class CommonModule {}
