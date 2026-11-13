import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/app.setup.js';
import { OllamaService } from '../src/infra/ollama/ollama.service.js';
import { PrismaService } from '../src/infra/prisma/prisma.service.js';

describe('Ask (e2e)', () => {
  let app: NestExpressApplication;
  const rows = [
    { content: 'Ingest prepares documents', source: 'glossary.md' },
    { content: 'Chunks are small pieces', source: 'how-it-works.md' },
  ];
  const embed = vi.fn().mockResolvedValue([0.1, 0.2]);
  const generate = vi.fn().mockResolvedValue('Ingest prepares documents.');
  const queryRaw = vi.fn().mockResolvedValue(rows);

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({ $queryRaw: queryRaw })
      .overrideProvider(OllamaService)
      .useValue({ embed, generate })
      .compile();

    app = module.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns the answer and the source chunks', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/ask')
      .send({ question: '  What is ingest?  ' })
      .expect(200);

    expect(response.body).toEqual({
      status: 200,
      message: 'Answer created',
      data: { answer: 'Ingest prepares documents.', sources: rows },
    });
    expect(embed).toHaveBeenCalledWith('What is ingest?');
    expect(generate).toHaveBeenCalledWith(
      "Answer only from the context. If it's not there, say you don't know.\n\n" +
        'Context:\nIngest prepares documents\n\nChunks are small pieces\n\n' +
        'Question: What is ingest?',
    );
  });

  it('rejects a blank question', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/ask')
      .send({ question: '   ' })
      .expect(400);

    expect(JSON.stringify(response.body)).toContain('Question is required');
    expect(generate).not.toHaveBeenCalled();
  });
});
