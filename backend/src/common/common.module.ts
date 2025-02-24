import { Module } from '@nestjs/common';
import { TextUtils } from './utils/text-analysis.utils';
import { CustomThrottlerGuard } from './guards/throttler.guard';

@Module({
  providers: [TextUtils, CustomThrottlerGuard],
  exports: [TextUtils, CustomThrottlerGuard],
})
export class CommonModule {}
