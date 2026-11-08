import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../config/env.js';

const EMBEDDING_MODEL = 'nomic-embed-text';
const ANSWER_MODEL = 'llama3.2';

@Injectable()
export class OllamaService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  // Turns text into a list of 768 numbers that represent its meaning.
  async embed(text: string): Promise<number[]> {
    const url = this.config.get('OLLAMA_URL', { infer: true });
    const response = await fetch(`${url}/api/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
    });
    if (!response.ok) {
      throw new ServiceUnavailableException('Could not create the embedding');
    }

    const { embeddings } = (await response.json()) as {
      embeddings: number[][];
    };
    return embeddings[0];
  }

  // Sends a prompt to the answer model and returns the text it writes.
  async generate(prompt: string): Promise<string> {
    const url = this.config.get('OLLAMA_URL', { infer: true });
    const response = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: ANSWER_MODEL, prompt, stream: false }),
    });
    if (!response.ok) {
      throw new ServiceUnavailableException('Could not create the answer');
    }

    const { response: answer } = (await response.json()) as {
      response: string;
    };
    return answer;
  }
}
