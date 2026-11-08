import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { OllamaService } from '../../infra/ollama/ollama.service.js';
import type { PrismaService } from '../../infra/prisma/prisma.service.js';
import { IngestService } from './ingest.service.js';

describe('IngestService', () => {
  let dataDir: string;
  let executeRaw: ReturnType<typeof vi.fn>;
  let transaction: ReturnType<typeof vi.fn>;
  let embed: ReturnType<typeof vi.fn>;
  let service: IngestService;

  beforeEach(async () => {
    dataDir = await mkdtemp(join(tmpdir(), 'ingest-'));
    executeRaw = vi.fn(
      (strings: TemplateStringsArray, ...values: unknown[]) => ({
        sql: strings.join('?'),
        values,
      }),
    );
    transaction = vi.fn().mockResolvedValue([]);
    embed = vi.fn().mockResolvedValue([0.1, 0.2]);
    service = new IngestService(
      {
        $executeRaw: executeRaw,
        $transaction: transaction,
      } as unknown as PrismaService,
      { embed } as unknown as OllamaService,
    );
  });

  afterEach(async () => {
    await rm(dataDir, { recursive: true });
  });

  it('deletes old chunks and saves one row per new chunk', async () => {
    await writeFile(join(dataDir, 'a.md'), 'first file');
    await writeFile(join(dataDir, 'b.txt'), 'second file');

    await expect(service.ingest(dataDir)).resolves.toBe(2);

    expect(transaction).toHaveBeenCalledTimes(1);
    const [deleteQuery, firstInsert, secondInsert] =
      transaction.mock.calls[0][0];
    expect(deleteQuery.sql).toContain('DELETE FROM chunks');
    expect(firstInsert.values).toEqual(['first file', 'a.md', '[0.1,0.2]']);
    expect(secondInsert.values).toEqual(['second file', 'b.txt', '[0.1,0.2]']);
  });

  it('ignores other file types', async () => {
    await writeFile(join(dataDir, 'a.md'), 'keep');
    await writeFile(join(dataDir, 'image.png'), 'skip');

    await expect(service.ingest(dataDir)).resolves.toBe(1);
    expect(embed).toHaveBeenCalledWith('keep');
  });

  it('does not delete old chunks when there is no text', async () => {
    await expect(service.ingest(dataDir)).rejects.toThrow('No text found');
    expect(transaction).not.toHaveBeenCalled();
  });

  it('does not delete old chunks when an embedding fails', async () => {
    await writeFile(join(dataDir, 'a.md'), 'text');
    embed.mockRejectedValue(new Error('Ollama is down'));

    await expect(service.ingest(dataDir)).rejects.toThrow('Ollama is down');
    expect(transaction).not.toHaveBeenCalled();
  });
});

describe('chunkText', () => {
  const service = new IngestService({} as PrismaService, {} as OllamaService);
  const chunkText = (text: string, size?: number, overlap?: number) =>
    service['chunkText'](text, size, overlap);

  it('returns short text as one chunk', () => {
    expect(chunkText('  short text  ')).toEqual(['short text']);
  });

  it('returns nothing for empty text', () => {
    expect(chunkText('   ')).toEqual([]);
  });

  it('keeps every chunk within the size', () => {
    const chunks = chunkText('word '.repeat(500));
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((chunk) => expect(chunk.length).toBeLessThanOrEqual(500));
  });

  it('does not cut words at the end of a chunk', () => {
    const chunks = chunkText('abcdefghi '.repeat(100), 55, 10);
    chunks
      .slice(0, -1)
      .forEach((chunk) => expect(chunk.endsWith('abcdefghi')).toBe(true));
  });

  it('repeats text between chunks', () => {
    const words = Array.from({ length: 60 }, (_, i) => `w${i}`).join(' ');
    const [first, second] = chunkText(words, 100, 20);
    expect(second.split(' ')).toContain(first.split(' ').at(-1));
  });

  it('starts chunks at a whole word', () => {
    const chunks = chunkText('abcdefghi '.repeat(100), 55, 15);
    chunks.forEach((chunk) => expect(chunk.startsWith('abcdefghi')).toBe(true));
  });

  it('still finishes when the text has no spaces', () => {
    const chunks = chunkText('a'.repeat(1000), 100, 10);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.at(-1)!.endsWith('a')).toBe(true);
  });
});
