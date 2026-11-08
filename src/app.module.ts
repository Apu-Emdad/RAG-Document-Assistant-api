import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ErrorLoggerModule } from './common/error-logger/error-logger.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { ErrorMessageInterceptor } from './common/interceptors/error-message.interceptor.js';
import { validateEnv } from './config/env.js';
import { HealthController } from './health/health.controller.js';
import { OllamaModule } from './infra/ollama/ollama.module.js';
import { PrismaModule } from './infra/prisma/prisma.module.js';
import { IngestModule } from './modules/ingest/ingest.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    PrismaModule,
    OllamaModule,
    ErrorLoggerModule,
    IngestModule,
  ],
  controllers: [HealthController],
  providers: [
    // Passes the route's @ErrorMessage to HttpExceptionFilter.
    { provide: APP_INTERCEPTOR, useClass: ErrorMessageInterceptor },
    // Sends every error that escapes a request in the Result shape.
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
