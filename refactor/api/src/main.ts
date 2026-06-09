import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const compression = require('compression');
import { join } from 'path';
import { AppModule } from './app.module';
import { TenantInterceptor } from './common/tenant.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  const logger = new Logger('Bootstrap');

  // Serve uploaded meter photos as static files at /uploads/*
  const uploadDir = process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadDir, { prefix: '/uploads' });

  // Gzip compression untuk semua response — hemat bandwidth ~60-70%
  app.use(compression());

  // Helmet dengan CSP minimal (tidak disabled total)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'unpkg.com'],  // leaflet dari CDN
        styleSrc: ["'self'", "'unsafe-inline'", 'unpkg.com'],
        imgSrc: ["'self'", 'data:', '*.tile.openstreetmap.org', 'picsum.photos'],
      },
    },
    crossOriginEmbedderPolicy: false, // diperlukan untuk WebView Leaflet
  }));

  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',').map((s) => s.trim()) : true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  app.useGlobalInterceptors(new TenantInterceptor());

  const secret = process.env.JWT_SECRET ?? '';
  const weakSecret = !secret || secret.includes('dev-secret') || secret.includes('ganti');
  if (process.env.NODE_ENV === 'production' && weakSecret) {
    logger.error('JWT_SECRET belum diganti untuk produksi!');
    process.exit(1);
  }
  if (weakSecret) logger.warn('JWT_SECRET masih default — WAJIB diganti sebelum produksi.');

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`API meter-air berjalan di http://0.0.0.0:${port}/api`);
}
bootstrap();
