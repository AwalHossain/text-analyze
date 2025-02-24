import { CustomThrottlerGuard } from '@common/guards/throttler.guard';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import databaseConfig from './config/database.config';
import { loggerConfig } from './config/logger.config';
import throttlerConfig from './config/throttler.config';
import { AuthModule } from './modules/auth/auth.module';
import { TextAnalyzerModule } from './modules/text-analyzer/text-analyzer.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, throttlerConfig],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // Add console.log to debug
        const ttl = parseInt(config.getOrThrow('throttler.ttl') || '60000', 10);
        const limit = parseInt(
          config.getOrThrow('throttler.limit') || '10',
          10,
        );
        return {
          throttlers: [
            {
              ttl,
              limit,
            },
          ],
        };
      },
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
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Logger,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
