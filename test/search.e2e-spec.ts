import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/app.setup.js';
import { OllamaService } from '../src/infra/ollama/ollama.service.js';
import { PrismaService } from '../src/infra/prisma/prisma.service.js';

describe('Search (e2e)', () => {
  let app: NestExpressApplication;
  const rows = [
    { content: 'Ingest prepares documents', source: 'glossary.md' },
  ];
  const embed = vi.fn().mockResolvedValue([0.1, 0.2]);
  const queryRaw = vi.fn().mockResolvedValue(rows);

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({ $queryRaw: queryRaw })
      .overrideProvider(OllamaService)
      .useValue({ embed })
      .compile();

    app = module.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns the closest chunks for a question', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/search')
      .send({ question: '  What is ingest?  ' })
      .expect(200);

    expect(response.body).toEqual({
      status: 200,
      message: 'Chunks found',
      data: { chunks: rows },
    });
    expect(embed).toHaveBeenCalledWith('What is ingest?');

    const [strings, ...values] = queryRaw.mock.calls[0];
    expect(strings.join('?')).toContain('ORDER BY embedding <=>');
    expect(values).toEqual(['[0.1,0.2]', 4]);
  });

  it.each([
    ['blank', { question: '   ' }, 'Question is required'],
    ['not text', { question: 5 }, 'Question must be text'],
  ])('rejects a question that is %s', async (_name, body, message) => {
    const response = await request(app.getHttpServer())
      .post('/api/search')
      .send(body)
      .expect(400);

    expect(JSON.stringify(response.body)).toContain(message);
    expect(embed).not.toHaveBeenCalled();
  });
});
