import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  // global prefix
  app.setGlobalPrefix('api');

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
