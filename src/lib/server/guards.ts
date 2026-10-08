import "server-only";

const budgets = new Map<string, { start: number; count: number }>();
export function takeRequest(bucket: "routing" | "context", maximum: number, now = Date.now()) {
  const current = budgets.get(bucket);
  if (!current || now - current.start >= 60000) {
    budgets.set(bucket, { start: now, count: 1 });
    return true;
  }
  if (current.count >= maximum) return false;
  current.count++;
  return true;
}
export async function boundedText(body: ReadableStream<Uint8Array> | null, maximum: number) {
  if (!body) throw new Error("Empty body");
  const reader = body.getReader();
  let length = 0,
    text = "";
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maximum) throw new Error("Body exceeds limit");
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
export const noStoreHeaders = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
