import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Express } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { ThrottlerExceptionFilter } from './common/filters/throttler-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add this line to trust proxy
  const expressApp = app.getHttpAdapter().getInstance() as Express;
  expressApp.set('trust proxy', true);
  // global prefix
  app.setGlobalPrefix('api');

  // Register global exception filters
  app.useGlobalFilters(new ThrottlerExceptionFilter());

  // swagger
  const options = new DocumentBuilder()
    .setTitle('Text Analyzer API')
    .setDescription('API for analyzing text')
    .setVersion('1.0')
    .addServer(process.env.API_URL || 'http://localhost:5000/', 'Production')
    .addTag('text-analyzer')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT', // This name here is important for references
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/docs', app, document);
  // use winston for logging
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER as string));
  // global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // cors
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT || 5000, () => {
    Logger.log(`Server is running on port ${process.env.PORT}`);
  });
}
bootstrap().catch((err) => {
  console.error(`Failed to bootstrap the application: ${err}`);
  process.exit(1);
});
