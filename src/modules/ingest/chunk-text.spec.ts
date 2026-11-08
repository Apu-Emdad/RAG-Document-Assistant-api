import { chunkText } from './chunk-text.js';

describe('chunkText', () => {
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
