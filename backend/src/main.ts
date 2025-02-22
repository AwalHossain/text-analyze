import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // global prefix
  app.setGlobalPrefix('api');

  // swagger
  const options = new DocumentBuilder()
    .setTitle('Text Analyzer API')
    .setDescription('API for analyzing text')
    .setVersion('1.0')
    .addServer('http://localhost:3000/', 'LocalDevelopment')
    .addTag('text-analyzer')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);
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

  await app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
    Logger.log(`Server is running on port ${process.env.PORT}`);
  });
}
bootstrap().catch((err) => {
  console.error(`Failed to bootstrap the application: ${err}`);
  process.exit(1);
});
