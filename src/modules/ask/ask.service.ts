import { HttpStatus, Injectable } from '@nestjs/common';
import type { Result } from '../../common/interfaces/result.interface.js';
import { OllamaService } from '../../infra/ollama/ollama.service.js';
import { SearchService } from '../search/search.service.js';
import { AskDto } from './ask.dto.js';

const INSTRUCTION =
  "Answer only from the context. If it's not there, say you don't know.";

@Injectable()
export class AskService {
  constructor(
    private readonly searchService: SearchService,
    private readonly ollama: OllamaService,
  ) {}

  async ask({ question }: AskDto): Promise<Result> {
    const { data } = await this.searchService.search({ question });
    const sources: { content: string; source: string }[] = data.chunks;
    const context = sources.map((chunk) => chunk.content).join('\n\n');

    const answer = await this.ollama.generate(
      `${INSTRUCTION}\n\nContext:\n${context}\n\nQuestion: ${question}`,
    );

    return {
      status: HttpStatus.OK,
      message: 'Answer created',
      data: { answer, sources },
    };
  }
}
