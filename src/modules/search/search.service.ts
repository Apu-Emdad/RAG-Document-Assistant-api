import { HttpStatus, Injectable } from '@nestjs/common';
import type { Result } from '../../common/interfaces/result.interface.js';
import { OllamaService } from '../../infra/ollama/ollama.service.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { SearchDto } from './search.dto.js';

const TOP_K = 4;

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ollama: OllamaService,
  ) {}

  async search({ question }: SearchDto): Promise<Result> {
    const embedding = await this.ollama.embed(question);

    // <=> measures how far apart two embeddings are. Smaller means closer in meaning.
    const chunks = await this.prisma.$queryRaw<
      { content: string; source: string }[]
    >`
      SELECT content, source
      FROM chunks
      ORDER BY embedding <=> ${JSON.stringify(embedding)}::vector
      LIMIT ${TOP_K}
    `;

    return { status: HttpStatus.OK, message: 'Chunks found', data: { chunks } };
  }
}
