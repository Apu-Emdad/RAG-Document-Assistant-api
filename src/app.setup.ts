import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { API_PREFIX } from './common/constants/api.js';
import type { Env } from './config/env.js';

// Shared by main.ts and the e2e tests, so tests run the app with the same setup.
export function configureApp(app: NestExpressApplication): void {
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.setGlobalPrefix(API_PREFIX);
  /**
   * Trust X-Forwarded-For only from a proxy on this machine (e.g. Nginx),
   * so req.ip is the visitor's IP instead of 127.0.0.1.
   */
  app.set('trust proxy', 'loopback');
  app.enableCors({
    origin: config.get('WEB_ORIGIN', { infer: true }),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
