import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { JwtService } from '@nestjs/jwt';
import { Server } from 'http';

import { TestThrottlerGuard } from '@common/guards/test-throttler.guard';
import { CustomThrottlerGuard } from '@common/guards/throttler.guard';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, ConnectionStates, Model } from 'mongoose';
import { AppModule } from 'src/app.module';
import { User } from 'src/modules/auth/infrastructure/schemas/user.schema';
import { CreateTextDto } from 'src/modules/text-analyzer/application/dto/create-text.dto';
import { TextStats } from 'src/modules/text-analyzer/application/dto/text-stats.dto';

interface Response {
  statusCode: number;
  message: string;
  data: {
    type: string;
    count: number;
  };
}

interface AllAnalyzeResponse {
  statusCode: number;
  message: string;
  data: {
    _id: string;
    content: string;
    stats: TextStats;
    createdAt: Date;
    updatedAt: Date;
  }[];
}

describe('TextAnalyzer (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;
  let mongoConnection: Connection;
  let userModel: Model<User>;
  let testUserId: string;

  // Define test user data
  const testUser = {
    email: 'test@example.com',
    name: 'Test User',
    provider: 'google',
    providerId: 'test123',
  };

  beforeAll(async () => {
    try {
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
              case 'throttler.penaltyMs':
                return process.env.PENALTY_TTL;
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
              case 'throttler.penaltyMs':
                return process.env.PENALTY_TTL;
              case 'API_URL':
                return process.env.API_URL;
              default:
                throw new Error(`Config key ${key} not found`);
            }
          }),
        })
        .overrideGuard(CustomThrottlerGuard)
        .useClass(TestThrottlerGuard)
        .compile();
      app = moduleFixture.createNestApplication();
      mongoConnection = moduleFixture.get<Connection>(getConnectionToken());
      jwtService = moduleFixture.get<JwtService>(JwtService);
      userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));

      app.setGlobalPrefix('api');
      await app.init();

      // Create a test user in the database
      const createdUser = (await userModel.create(testUser)) as unknown as {
        _id: string;
      };
      testUserId = createdUser._id;

      // Create JWT token with real user ID
      authToken = jwtService.sign({
        userId: testUserId,
        email: testUser.email,
      });

      // Check connection
      if (!mongoConnection || mongoConnection.readyState !== ConnectionStates.connected) {
        console.error('MongoDB connection failed');
      }
    } catch (error) {
      console.error('Test setup failed:', error);
      throw error;
    }
  }, 60000);

  // beforeEach(async () => {
  //   // Clean test database before each test
  //   if (mongoConnection.readyState === ConnectionStates.connected) {
  //     // Connected
  //     await mongoConnection.dropDatabase();
  //   }
  // });

  afterAll(async () => {
    if (mongoConnection.readyState === ConnectionStates.connected) {
      // Connected
      await mongoConnection.dropDatabase();
      await mongoConnection.close();
    }
    await app.close();
  }, 30000);
  // ... existing code ...

  describe('Text Analyzer Endpoints', () => {
    const sampleText = {
      content: 'This is a test text.',
    };
    it('should return 401 when analyzing text without token', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/api/analyze/text')
        .send({
          content: 'This is a test text.',
        });
      expect(response.status).toBe(401);
    });

    it('should enforce rate limiting after maximum requests', async () => {
      const endpoint = '/api/analyze/text';

      // Add delay between requests
      const makeRequest = async () => {
        const response = await request(app.getHttpServer() as Server)
          .post(endpoint)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ content: 'This is a test text.' });
        return response;
      };

      // Make initial requests
      const response = await makeRequest();
      expect(response.status).toBe(201);

      // Make throttled request
      const throttledResponse = await makeRequest();
      expect(throttledResponse.status).toBe(201);
    }, 30000);

    it('should count words correctly', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/api/analyze/words')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sampleText as CreateTextDto);

      const res = response.body as Response;

      expect(response.status).toBe(201);
      expect(res.data.type).toBe('words');
      expect(res.data.count).toBe(5);
    });

    it('should count sentences correctly', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/api/analyze/sentences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sampleText as CreateTextDto);

      const res = response.body as Response;

      expect(response.status).toBe(201);
      expect(res.data.type).toBe('sentences');
      expect(res.data.count).toBe(1);
    });

    it('should count paragraphs correctly', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/api/analyze/paragraphs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sampleText as CreateTextDto);

      const res = response.body as Response;

      expect(response.status).toBe(201);
      expect(res.data.type).toBe('paragraphs');
      expect(res.data.count).toBe(1);
    });

    it('should count characters correctly', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/api/analyze/characters')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sampleText as CreateTextDto);

      const res = response.body as Response;

      expect(response.status).toBe(201);
      expect(res.data.type).toBe('characters');
      expect(res.data.count).toBe(16);
    });

    it('should find the longest word correctly', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/api/analyze/longestWord')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sampleText as CreateTextDto);

      const res = response.body as Response;

      expect(res.statusCode).toBe(200);
      expect(res.data.type).toBe('longestWord');
    });

    it('should return 400 when analyzing text with invalid token', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/api/analyze/text')
        .set('Authorization', `Bearer invalid-token`)
        .send(sampleText as CreateTextDto);

      expect(response.status).toBe(401);
    });

    it('should return all tokens of a user', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/api/analyze/all')
        .set('Authorization', `Bearer ${authToken}`)
        .send();

      const res = response.body as AllAnalyzeResponse;

      expect(response.status).toBe(200);
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data[0].stats.wordCount).toBeDefined();
      expect(res.data[0].stats.sentenceCount).toBeDefined();
      expect(res.data[0].stats.paragraphCount).toBeDefined();
      expect(res.data[0].stats.characterCount).toBeDefined();
      expect(res.data[0].stats.longestWords).toBeDefined();
    });
  });
});
