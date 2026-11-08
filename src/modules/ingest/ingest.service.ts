import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { Injectable, Logger } from '@nestjs/common';
import { OllamaService } from '../../infra/ollama/ollama.service.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { chunkText } from './chunk-text.js';

const DATA_DIR = join(process.cwd(), 'data');
const SUPPORTED_EXTENSIONS = ['.md', '.txt'];

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
      const contents = chunkText(text);
      for (const content of contents) {
        const embedding = await this.ollama.embed(content);
        chunks.push({ content, source, embedding });
      }
      this.logger.log(`${source}: ${contents.length} chunks`);
    }

    if (!chunks.length) throw new Error(`No text found in ${dataDir}`);

    await this.replaceChunks(chunks);
    return chunks.length;
  }

  // Runs as one transaction, so a failed save keeps the old chunks.
  private async replaceChunks(chunks: NewChunk[]): Promise<void> {
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
  }
}
