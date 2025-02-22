import { Module } from '@nestjs/common';
import { TextUtils } from './utils/text-analysis.utils';

@Module({
  providers: [TextUtils],
  exports: [TextUtils],
})
export class CommonModule {}
