import { describe, expect, test } from "vitest";
import { evidenceSchema } from "./schema";
import { syntheticEvidence } from "@/test/fixtures";
import { completedTrades, matchesFilter, parseFilter, parseView, pct } from "./selectors";

describe("evidence contract", () => {
  test("accepts a complete synthetic contract without any private market data", () =>
    expect(evidenceSchema.safeParse(syntheticEvidence()).success).toBe(true));
  test.each([
    "reserve",
    "gate",
    "hash",
    "duplicate",
    "count",
    "endpoint",
    "order",
    "distribution",
    "cost",
    "labels",
    "extra",
  ] as const)("rejects %s corruption", (kind) => {
    const data = syntheticEvidence();
    if (kind === "reserve") data.audit[0].signal_date = "2025-01-01";
    if (kind === "gate") Object.assign(data, { advance_gate_passed: true });
    if (kind === "hash") Object.assign(data.source_hashes, { "comparison.json": "0".repeat(64) });
    if (kind === "duplicate") data.audit[1].event_id = data.audit[0].event_id;
    if (kind === "count") data.audit.pop();
    if (kind === "endpoint") data.equity[48].jev = 120000;
    if (kind === "order") data.equity[2].date = data.equity[1].date;
    if (kind === "distribution") data.audit[0].baseline_net_trade_return = 0.04;
    if (kind === "cost") data.cost_scenarios["5"].jev.modeled_cost_usd = 0;
    if (kind === "labels") data.audit[34].risk_choice = "stressed";
    if (kind === "extra") Object.assign(data, { unexpected: "not allowed" });
    expect(evidenceSchema.safeParse(data).success).toBe(false);
  });
  test("reconciles filters, excludes open positions and bounds URL state", () => {
    const trades = completedTrades(syntheticEvidence());
    expect(trades).toHaveLength(55);
    expect(trades.filter((event) => matchesFilter(event, "skipped"))).toHaveLength(34);
    expect(trades.filter((event) => matchesFilter(event, "taken"))).toHaveLength(21);
    expect(trades.filter((event) => matchesFilter(event, "missed_winners"))).toHaveLength(13);
    expect(trades.filter((event) => matchesFilter(event, "avoided_losses"))).toHaveLength(21);
    expect(matchesFilter(syntheticEvidence().audit[58], "all")).toBe(false);
    expect(parseView("arbitrary")).toBe("comparison");
    expect(parseFilter("arbitrary")).toBe("all");
    expect(pct(-0.125)).toBe("−12.50%");
  });
});
