import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { IngestService } from './modules/ingest/ingest.service.js';

// Run with `yarn ingest`. Reads the files in /data and replaces all saved chunks.
const app = await NestFactory.createApplicationContext(AppModule);
const total = await app.get(IngestService).ingest();
new Logger('Ingest').log(`Saved ${total} chunks`);
await app.close();
