// @vitest-environment node
import { describe, expect, test, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { classifyWithJev } from "./routing/jev";
import { GET } from "@/app/api/context/route";

describe.skipIf(process.env.EDISON_LIVE_CHECK !== "true")(
  "opt-in public integration checks (no keys, no paid model, no market bars)",
  () => {
    test.each([
      ["Did AI improve this strategy—or just trade less?", "comparison"],
      ["Show the profitable trades Jev skipped.", "missed_winners"],
      ["Which losing trades did AI avoid?", "avoided_losses"],
    ])("free structured routing: %s", async (question, intent) => {
      const result = await classifyWithJev(question);
      expect(result?.intent).toBe(intent);
      expect(result?.confidence).toBeGreaterThanOrEqual(0.7);
    });
    test("retrieves only read-only Bitget symbol constraints", async () => {
      const response = await GET(new Request("http://edison.test/api/context?symbol=RAAPLUSDT"));
      expect(response.status).toBe(200);
      const snapshot = await response.json();
      expect(snapshot.data.symbol).toBe("RAAPLUSDT");
      expect(snapshot.data).not.toHaveProperty("price");
    });
  },
);
