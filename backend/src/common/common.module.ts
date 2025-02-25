import { Module } from '@nestjs/common';
import { DeviceThrottlerGuard } from './guards/device-throttler.guard';
import { CustomThrottlerGuard } from './guards/throttler.guard';
import { RateLimiterService } from './services/rate-limiter.service';
import { TextUtils } from './utils/text-analysis.utils';

@Module({
  providers: [TextUtils, CustomThrottlerGuard, RateLimiterService, DeviceThrottlerGuard],
  exports: [TextUtils, CustomThrottlerGuard, RateLimiterService, DeviceThrottlerGuard],
})
export class CommonModule {}
