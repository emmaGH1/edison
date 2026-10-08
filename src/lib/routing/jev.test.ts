// @vitest-environment node
import { afterEach, expect, test, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { answerSchema, classifyWithJev } from "./jev";
const reply = () => ({
  model: "jev-1.13-free",
  cost: "0",
  answers: {
    research_view: {
      type: "choice",
      choice: "comparison",
      confidence: 0.9,
      probabilities: {
        comparison: 0.9,
        missed_winners: 0.02,
        avoided_losses: 0.02,
        costs: 0.02,
        evidence_limits: 0.02,
        unsupported: 0.02,
      },
    },
  },
});
afterEach(() => vi.unstubAllGlobals());
test("validates the exact free model, zero cost and finite probability distribution", () => {
  expect(answerSchema.safeParse(reply()).success).toBe(true);
  expect(answerSchema.safeParse({ ...reply(), model: "paid" }).success).toBe(false);
  expect(answerSchema.safeParse({ ...reply(), cost: "0.01" }).success).toBe(false);
  const bad = reply();
  bad.answers.research_view.probabilities.comparison = 0.1;
  expect(answerSchema.safeParse(bad).success).toBe(false);
});
test("makes one bounded call without authorization and returns only an intent", async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(reply())));
  vi.stubGlobal("fetch", fetcher);
  expect(await classifyWithJev("Compare the policies")).toEqual({
    intent: "comparison",
    confidence: 0.9,
  });
  expect(fetcher).toHaveBeenCalledTimes(1);
  const config = fetcher.mock.calls[0][1];
  expect(config.headers).toEqual({ "Content-Type": "application/json" });
  expect(JSON.parse(config.body).model).toBe("jev-1.13-free");
});
test("provider failures, oversized replies and malformed answers do not retry", async () => {
  const fetcher = vi.fn().mockRejectedValue(new Error("Unavailable"));
  vi.stubGlobal("fetch", fetcher);
  expect(await classifyWithJev("Compare policies")).toBeNull();
  expect(fetcher).toHaveBeenCalledTimes(1);
  fetcher.mockResolvedValue(new Response("x".repeat(17000)));
  expect(await classifyWithJev("Compare policies")).toBeNull();
  fetcher.mockResolvedValue(new Response(JSON.stringify({ ...reply(), cost: 1 })));
  expect(await classifyWithJev("Compare policies")).toBeNull();
});
