import { Module, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { CommonModule } from './common/common.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './config/logger.config';
import { TextAnalyzerModule } from './modules/text-analyzer/text-analyzer.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('database.uri'),
      }),
      inject: [ConfigService],
    }),
    WinstonModule.forRoot(loggerConfig),
    TextAnalyzerModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
