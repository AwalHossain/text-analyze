import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';

export class TestUtils {
  static async createTestingApp(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();

    // Mirror main.ts setup
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
    return app;
  }
}
