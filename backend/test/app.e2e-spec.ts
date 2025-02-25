import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

type Response = {
  body: {
    status: string;
    timestamp: string;
    services: { database: string; logger: string };
  };
};
describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let mongoConnection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    mongoConnection = moduleFixture.get<Connection>(getConnectionToken());

    // Mirror main.ts setup
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER as string));

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.setGlobalPrefix('api');

    app.enableCors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
      await mongoConnection.close();
    }
  });

  it('/ (GET)', async () => {
    for (let i = 0; i < 10; i++) {
      await request(app.getHttpServer())
        .get('/api/')
        .expect(200)
        .expect('Hello World!');
    }
  });

  it('/health (GET)', () => {
    for (let i = 0; i <10; i++) {
      request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((response: Response) => {
          const body = response.body;
          expect(body).toBeDefined();
          expect(body.status).toBe('OK');
          expect(body.timestamp).toBeDefined();
          expect(body.services).toBeDefined();
          expect(body.services.database).toBeDefined();
          expect(body.services.logger).toBe('up');
        });
    }
  });
});
