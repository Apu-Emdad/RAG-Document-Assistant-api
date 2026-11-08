export const CHUNK_SIZE = 500;
export const CHUNK_OVERLAP = 50;

/**
 * Splits text into pieces of about CHUNK_SIZE characters.
 * Each piece repeats the end of the one before it, so an idea cut at the
 * edge of a chunk can still be found in the next one.
 */
export function chunkText(
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
