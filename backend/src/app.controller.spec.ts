/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './config/logger.config';
import { Logger } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [databaseConfig],
        }),
        MongooseModule.forRoot(
          process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test',
        ),
        WinstonModule.forRoot(loggerConfig),
      ],
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            info: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health check', () => {
    it('should return health status "OK"', async () => {
      const result = await appController.getHealth();
      expect(result).toMatchObject({
        status: expect.stringMatching(/^OK$/),
        timestamp: expect.any(String),
        services: {
          database: expect.stringMatching(/^up$/),
          logger: expect.stringMatching(/^up$/),
        },
      });
    });
  });
});
