import { Module } from '@nestjs/common';
import { TextAnalysisController } from './controllers/text-analysis/text-analysis.controller';
import { TextAnalysisService } from './services/text-analysis/text-analysis.service';

@Module({
  controllers: [TextAnalysisController],
  providers: [TextAnalysisService],
})
export class TextAnalysisModule {}
