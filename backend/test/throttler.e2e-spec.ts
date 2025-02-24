import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Server } from 'http';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';

interface Response {
  statusCode: number;
  message: string;
  data: {
    type: string;
    count: number;
  };
}

describe('Throttler (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;
  let testUserId: string;
  let requestCount = 0;

  beforeEach(async () => {
    requestCount = 0;

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          switch (key) {
            case 'database.uri':
              return process.env.MONGODB_TEST_URI;
            case 'JWT_SECRET':
              return process.env.TEST_JWT_SECRET;
            case 'GOOGLE_CLIENT_ID':
              return process.env.TEST_GOOGLE_CLIENT_ID;
            case 'GOOGLE_CLIENT_SECRET':
              return process.env.TEST_GOOGLE_CLIENT_SECRET;
            case 'throttler.ttl':
              return process.env.TEST_THROTTLE_TTL;
            case 'throttler.limit':
              return 3;
            default:
              return null;
          }
        }),
        getOrThrow: jest.fn((key: string) => {
          switch (key) {
            case 'GOOGLE_CLIENT_ID':
              return process.env.TEST_GOOGLE_CLIENT_ID;
            case 'GOOGLE_CLIENT_SECRET':
              return process.env.TEST_GOOGLE_CLIENT_SECRET;
            case 'throttler.ttl':
              return process.env.TEST_THROTTLE_TTL;
            case 'throttler.limit':
              return 3;
            default:
              throw new Error(`Config key ${key} not found`);
          }
        }),
      })
      .overrideGuard(ThrottlerGuard)
      .useValue({
        canActivate: (context) => {
          requestCount++;
          if (requestCount <= 3) {
            return true;
          }
          const error = new Error('ThrottlerException: Too Many Requests');
          error.name = 'ThrottlerException';
          throw error;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);

    testUserId = 'test-user-id';
    authToken = jwtService.sign({
      userId: testUserId,
      email: 'test@example.com',
    });

    app.setGlobalPrefix('api');
    await app.init();
  });

  it('should block requests that exceed rate limit', async () => {
    const sampleText = {
      content: 'This is a test text.',
    };

    // Test successful requests
    for (let i = 0; i < 3; i++) {
      const response = await request(app.getHttpServer() as Server)
        .post('/api/analyze/words')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sampleText);

      const res = response.body as Response;

      expect(res.statusCode).toBe(200);
      console.log(`Request ${i + 1} status:`, response.statusCode);
    }

    // Test throttled request
    const throttledResponse = await request(app.getHttpServer() as Server)
      .post('/api/analyze/words')
      .set('Authorization', `Bearer ${authToken}`)
      .send(sampleText);

    console.log('Throttled request status:', throttledResponse.statusCode);
    expect(throttledResponse.statusCode).toBe(429);
  }, 10000);

  afterAll(async () => {
    await app.close();
  });
});
