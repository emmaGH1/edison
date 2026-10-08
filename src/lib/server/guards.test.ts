// @vitest-environment node
import { expect, test, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { boundedText, takeRequest } from "./guards";
test("enforces a process-wide bounded provider budget and resets after a minute", () => {
  expect(takeRequest("context", 2, 1000)).toBe(true);
  expect(takeRequest("context", 2, 1001)).toBe(true);
  expect(takeRequest("context", 2, 1002)).toBe(false);
  expect(takeRequest("context", 2, 61000)).toBe(true);
});
test("caps bodies including streamed chunks instead of trusting Content-Length", async () => {
  expect(await boundedText(new Response("hello").body, 5)).toBe("hello");
  await expect(boundedText(new Response("too much").body, 3)).rejects.toThrow("Body exceeds limit");
  await expect(boundedText(null, 3)).rejects.toThrow("Empty body");
});
