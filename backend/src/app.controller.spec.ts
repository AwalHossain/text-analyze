/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Logger } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn(),
            checkHealth: jest.fn(),
          },
        },
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
    appService = app.get<AppService>(AppService);
  });

  describe('health check', () => {
    it('should return health status "OK"', async () => {
      jest.spyOn(appService, 'checkHealth').mockResolvedValue({
        status: 'OK',
        timestamp: new Date().toISOString(),
        services: {
          database: 'up',
          logger: 'up',
        },
      });

      const result = await appController.getHealth();

      expect(result).toMatchObject({
        status: 'OK',
        timestamp: expect.any(String),
        services: {
          database: expect.stringMatching(/^up$/),
          logger: expect.stringMatching(/^up$/),
        },
      });
    });

    it('should handle database connection failure gracefully', async () => {
      // Mock service to simulate database failure
      jest.spyOn(appService, 'checkHealth').mockResolvedValue({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        services: {
          database: 'down',
          logger: 'up',
        },
      });

      const result = await appController.getHealth();

      expect(result).toMatchObject({
        status: expect.stringMatching(/^ERROR$/),
        services: {
          database: expect.stringMatching(/^down$/),
          logger: expect.stringMatching(/^up$/),
        },
      });
    });

    it('should handle logger service failure gracefully', async (): Promise<void> => {
      jest.spyOn(appService, 'checkHealth').mockResolvedValue({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        services: {
          database: 'up',
          logger: 'down',
        },
      });

      const result = await appController.getHealth();

      expect(result).toMatchObject({
        status: expect.stringMatching(/^ERROR$/),
        services: {
          database: expect.stringMatching(/^up$/),
          logger: expect.stringMatching(/^down$/),
        },
      });
    });
  });
});
