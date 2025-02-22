import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TextDocument, TextSchema } from './infrastructure/schemas/text.schema';
import { TextAnalyzerService } from './application/services/text-analyer.service';
import { TextAnalyzerController } from './presentation/controllers/text-analyzer.controller';
import { TextRepository } from './infrastructure/repositories/text.repository';
import { CommonModule } from 'src/common/common.module';
import { CacheModule } from '@nestjs/cache-manager';
@Module({
  imports: [
    CommonModule,
    MongooseModule.forFeature([
      {
        name: TextDocument.name,
        schema: TextSchema,
      },
    ]),

    CacheModule.register({
      isGlobal: true,
    }),
  ],
  controllers: [TextAnalyzerController],
  providers: [TextAnalyzerService, TextRepository],
  exports: [TextAnalyzerService],
})
export class TextAnalyzerModule {}
