// @vitest-environment node
import { readFileSync, existsSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { evidenceSchema } from "./schema";

const path = ".edison-private/evidence.json";
describe.skipIf(!existsSync(path))("authorized local frozen bundle (not shipped)", () => {
  test("validates the source receipts, complete distribution and equity endpoints", () => {
    expect(evidenceSchema.safeParse(JSON.parse(readFileSync(path, "utf8"))).success).toBe(true);
  });
  test("rejects a changed gate, unknown fields and reserved history", () => {
    const data = JSON.parse(readFileSync(path, "utf8"));
    expect(evidenceSchema.safeParse({ ...data, market_price_reserve_read: true }).success).toBe(
      false,
    );
    expect(
      evidenceSchema.safeParse({ ...data, corporate_action_reserve_fully_unopened: true }).success,
    ).toBe(false);
    expect(evidenceSchema.safeParse({ ...data, advance_gate_passed: true }).success).toBe(false);
    expect(evidenceSchema.safeParse({ ...data, secret: "not allowed" }).success).toBe(false);
    expect(
      evidenceSchema.safeParse({
        ...data,
        audit: data.audit.map((event: object) => ({ ...event, signal_date: "2025-01-01" })),
      }).success,
    ).toBe(false);
  });
});
