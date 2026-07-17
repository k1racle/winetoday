import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { createMediaAvifMiddleware } from './modules/media/media-avif.middleware';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const UPLOADS_DIR = '/app/uploads';
const BACKEND_UPLOADS_DIR = '/app/public/uploads';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());
  app.use('/uploads', createMediaAvifMiddleware([UPLOADS_DIR, BACKEND_UPLOADS_DIR]));
  app.useStaticAssets(UPLOADS_DIR, {
    prefix: '/uploads',
    setHeaders: avifContentTypeHeader,
  });
  app.useStaticAssets(BACKEND_UPLOADS_DIR, {
    prefix: '/uploads',
    setHeaders: avifContentTypeHeader,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigin
      ? corsOrigin.split(',').map((o) => o.trim())
      : true,
    credentials: true,
  });

  app.setGlobalPrefix('api', {
    exclude: ['health'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 4000);

  await app.listen(port);
  console.log(`API listening on http://localhost:${port}`);
}

function avifContentTypeHeader(res: any, filePath: string) {
  if (filePath.toLowerCase().endsWith('.avif')) {
    res.setHeader('Content-Type', 'image/avif');
  }
}

bootstrap();
