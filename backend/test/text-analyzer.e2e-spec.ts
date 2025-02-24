import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { JwtService } from '@nestjs/jwt';
import { Server } from 'http';
import { CreateTextDto } from 'src/modules/text-analyzer/application/dto/create-text.dto';

import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { Connection, ConnectionStates, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/modules/auth/infrastructure/schemas/user.schema';
import { TextStats } from 'src/modules/text-analyzer/application/dto/text-stats.dto';

interface Response {
  statusCode: number;
  message: string;
  data: {
    type: string;
    count: number;
  };
}
interface AnalyzeResponse {
  statusCode: number;
  message: string;
  data: {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    characterCount: number;
    longestWord: string[];
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
              return 'test-secret';
            case 'GOOGLE_CLIENT_ID':
              return 'mock-client-id';
            case 'GOOGLE_CLIENT_SECRET':
              return 'mock-client-secret';
            default:
              return null;
          }
        }),
        getOrThrow: jest.fn((key: string) => {
          switch (key) {
            case 'GOOGLE_CLIENT_ID':
              return 'mock-client-id';
            case 'GOOGLE_CLIENT_SECRET':
              return 'mock-client-secret';
            default:
              throw new Error(`Config key ${key} not found`);
          }
        }),
      })
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
  }, 30000);

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
      content:
        'This is a test text. It has multiple sentences! And some more...',
      userId: 'test-user-id',
    };

    it('should return 401 when analyzing text without token', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/api/analyze/text')
        .send({
          content: 'This is a test text.',
        });

      console.log('Unauthorized response:', response.body);
      expect(response.status).toBe(401);
    });

    it('should analyze text successfully with valid token', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/api/analyze/text')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sampleText as CreateTextDto);

      const analyzeResponse = response.body as AnalyzeResponse;

      console.log('Analyze response:', response.body);

      expect(response.status).toBe(201);
      expect(analyzeResponse.data).toBeDefined();
      expect(analyzeResponse.data.wordCount).toBe(12);
      expect(analyzeResponse.data.sentenceCount).toBe(3);
    });

    it('should count words correctly', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/api/analyze/words')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sampleText as CreateTextDto);

      const res = response.body as Response;

      console.log('Word count response:', response.body);
      expect(response.status).toBe(201);
      expect(res.data.type).toBe('words');
      expect(res.data.count).toBe(12);
    });

    it('should count sentences correctly', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/api/analyze/sentences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sampleText as CreateTextDto);

      const res = response.body as Response;

      console.log('Sentence count response:', response.body);
      expect(response.status).toBe(201);
      expect(res.data.type).toBe('sentences');
      expect(res.data.count).toBe(3);
    });

    it('should count paragraphs correctly', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/api/analyze/paragraphs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sampleText as CreateTextDto);

      const res = response.body as Response;

      console.log('Paragraph count response:', response.body);
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

      console.log('Character count response:', response.body);
      expect(response.status).toBe(201);
      expect(res.data.type).toBe('characters');
      expect(res.data.count).toBe(53);
    });

    it('should find the longest word correctly', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/api/analyze/longestWord')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sampleText as CreateTextDto);

      const res = response.body as Response;

      console.log('Longest word response:', response.body);
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

    // get all token of a user
    it('should return all tokens of a user', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/api/analyze/all')
        .set('Authorization', `Bearer ${authToken}`)
        .send();

      const res = response.body as AllAnalyzeResponse;
      console.log('Tokens response:', response.body);

      console.log('Tokens response:', response.body);
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
