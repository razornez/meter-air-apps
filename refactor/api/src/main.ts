import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Header keamanan HTTP (XSS, sniffing, dll).
  app.use(helmet());

  // CORS: produksi sebaiknya batasi origin via env CORS_ORIGIN (pisahkan koma).
  // Dev (kosong) → izinkan semua agar mobile/emulator mudah terhubung.
  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigin
      ? corsOrigin.split(',').map((s) => s.trim())
      : true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Cegah jalan di produksi dengan secret default.
  const secret = process.env.JWT_SECRET ?? '';
  const weakSecret =
    !secret || secret.includes('dev-secret') || secret.includes('ganti');
  if (process.env.NODE_ENV === 'production' && weakSecret) {
    logger.error(
      'JWT_SECRET belum diganti untuk produksi! Setel JWT_SECRET yang acak & panjang.',
    );
    process.exit(1);
  }
  if (weakSecret) {
    logger.warn('JWT_SECRET masih default — WAJIB diganti sebelum produksi.');
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`API meter-air berjalan di http://localhost:${port}/api`);
}
bootstrap();
