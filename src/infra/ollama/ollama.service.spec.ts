import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../config/env.js';
import { OllamaService } from './ollama.service.js';

describe('OllamaService', () => {
  const config = {
    get: () => 'http://ollama.test',
  } as unknown as ConfigService<Env, true>;
  const service = new OllamaService(config);

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends the text to the embedding model and returns the numbers', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ embeddings: [[0.1, 0.2]] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(service.embed('hello')).resolves.toEqual([0.1, 0.2]);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('http://ollama.test/api/embed');
    expect(JSON.parse(options.body)).toEqual({
      model: 'nomic-embed-text',
      input: 'hello',
    });
  });

  it('throws when Ollama returns an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    await expect(service.embed('hello')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('sends the prompt to the answer model and returns its text', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ response: 'An answer' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(service.generate('hello')).resolves.toBe('An answer');

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('http://ollama.test/api/generate');
    expect(JSON.parse(options.body)).toEqual({
      model: 'llama3.2',
      prompt: 'hello',
      stream: false,
    });
  });

  it('throws when Ollama cannot write the answer', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    await expect(service.generate('hello')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
