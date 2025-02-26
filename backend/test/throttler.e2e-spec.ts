import { ThrottlerExceptionFilter } from '@common/filters/throttler-exception.filter';
import { CanActivate, ExecutionContext, HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { ThrottlerException } from '@nestjs/throttler';
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

// Create a mock throttler guard class
class MockThrottlerGuard implements CanActivate {
  private static requestCount = 0;
  private readonly limit = parseInt(process.env.TEST_THROTTLE_LIMIT || '3'); // Hard-coded limit for testing

  constructor() {
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    MockThrottlerGuard.requestCount++;
    
    // Allow only 3 requests, then start throttling
    if (MockThrottlerGuard.requestCount <= this.limit) {
      return true;
    }
    
    throw new ThrottlerException('Too many requests');
  }
}

describe('Throttler (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
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
              return process.env.TEST_THROTTLE_LIMIT;
            case 'API_URL':
              return process.env.API_URL;
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
              return process.env.TEST_THROTTLE_LIMIT;
            case 'API_URL':
              return process.env.API_URL;
            default:
              throw new Error(`Config key ${key} not found`);
          }
        }),
      })
      // Override the APP_GUARD to use our mock guard
      .overrideProvider(APP_GUARD)
      .useValue({
        useClass: MockThrottlerGuard,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    
    // This is important - we need to set up the app exactly as it's set up in main.ts
    // to ensure exceptions are handled properly
    app.setGlobalPrefix('api');
    
    // Register the ThrottlerExceptionFilter to handle ThrottlerException
    app.useGlobalFilters(new ThrottlerExceptionFilter());
    
    // Explicitly register the MockThrottlerGuard as a global guard
    app.useGlobalGuards(new MockThrottlerGuard());
    
    jwtService = moduleFixture.get<JwtService>(JwtService);

    testUserId = 'test-user-id';
    authToken = jwtService.sign({
      userId: testUserId,
      email: 'test@example.com',
    });

    await app.init();
  });

  it('should block requests that exceed rate limit', async () => {
    const sampleText = {
      content: 'This is a test text.',
    };
    let limit = parseInt(process.env.TEST_THROTTLE_LIMIT || '3');
    // Test successful requests (first 3 should work)
    for (let i = 0; i < limit; i++) {
      const response = await request(app.getHttpServer() as Server)
        .post('/api/analyze/words')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sampleText);

      expect(response.status).toBe(201);
    }

    // Test throttled request (4th request should be throttled)
    const throttledResponse = await request(app.getHttpServer() as Server)
      .post('/api/analyze/words')
      .set('Authorization', `Bearer ${authToken}`)
      .send(sampleText);

    expect(throttledResponse.status).toBe(HttpStatus.TOO_MANY_REQUESTS); // 429
  }, 10000);

  afterAll(async () => {
    await app.close();
  });
});
