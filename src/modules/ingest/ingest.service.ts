import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { Injectable, Logger } from '@nestjs/common';
import { OllamaService } from '../../infra/ollama/ollama.service.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';

const DATA_DIR = join(process.cwd(), 'data');
const SUPPORTED_EXTENSIONS = ['.md', '.txt'];
const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

interface NewChunk {
  content: string;
  source: string;
  embedding: number[];
}

@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ollama: OllamaService,
  ) {}

  // Returns how many chunks were saved.
  async ingest(dataDir = DATA_DIR): Promise<number> {
    const files = (await readdir(dataDir))
      .filter((file) =>
        SUPPORTED_EXTENSIONS.includes(extname(file).toLowerCase()),
      )
      .sort();

    const chunks: NewChunk[] = [];
    for (const source of files) {
      const text = await readFile(join(dataDir, source), 'utf8');
      const contents = this.chunkText(text);
      for (const content of contents) {
        const embedding = await this.ollama.embed(content);
        chunks.push({ content, source, embedding });
      }
      this.logger.log(`${source}: ${contents.length} chunks`);
    }

    if (!chunks.length) throw new Error(`No text found in ${dataDir}`);

    // Runs as one transaction, so a failed save keeps the old chunks.
    await this.prisma.$transaction([
      this.prisma.$executeRaw`DELETE FROM chunks`,
      ...chunks.map(
        ({ content, source, embedding }) =>
          this.prisma.$executeRaw`
            INSERT INTO chunks (content, source, embedding)
            VALUES (${content}, ${source}, ${JSON.stringify(embedding)}::vector)
          `,
      ),
    ]);

    return chunks.length;
  }

  /**
   * Splits text into pieces of about CHUNK_SIZE characters.
   * Each piece repeats the end of the one before it, so an idea cut at the
   * edge of a chunk can still be found in the next one.
   */
  private chunkText(
    text: string,
    size = CHUNK_SIZE,
    overlap = CHUNK_OVERLAP,
  ): string[] {
    const content = text.trim();
    const chunks: string[] = [];
    let start = 0;

    while (start < content.length) {
      let end = Math.min(start + size, content.length);
      if (end < content.length) {
        // Break at the last space or new line, so words stay whole.
        const lastBreak = content.slice(start, end).search(/\s\S*$/);
        if (lastBreak > overlap) end = start + lastBreak;
      }

      const chunk = content.slice(start, end).trim();
      if (chunk) chunks.push(chunk);
      if (end === content.length) break;

      // Start the next chunk at a whole word inside the overlap.
      start = end - overlap;
      const nextBreak = content.slice(start, end).search(/\s/);
      if (nextBreak !== -1) start += nextBreak;
    }

    return chunks;
  }
}
