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
    "old_source",
    "reserve_disclosure",
    "policy_count",
    "source_metadata",
    "attribution",
    "early_date",
    "post_cutoff",
  ] as const)("rejects %s corruption", (kind) => {
    const data = syntheticEvidence();
    if (kind === "reserve") data.audit[0].signal_date = "2025-01-01";
    if (kind === "gate") Object.assign(data, { advance_gate_passed: true });
    if (kind === "hash") Object.assign(data.source_hashes, { "comparison.json": "0".repeat(64) });
    if (kind === "duplicate") data.audit[1].event_id = data.audit[0].event_id;
    if (kind === "count") data.audit.pop();
    if (kind === "endpoint") data.equity[30].jev = 120000;
    if (kind === "order") data.equity[2].date = data.equity[1].date;
    if (kind === "distribution") data.audit[0].baseline_net_trade_return = 0.04;
    if (kind === "cost") data.cost_scenarios["5"].jev.modeled_cost_usd = 0;
    if (kind === "labels") data.audit[24].risk_choice = "stressed";
    if (kind === "extra") Object.assign(data, { unexpected: "not allowed" });
    if (kind === "old_source") Object.assign(data, { version: "edison-evidence-v1" });
    if (kind === "reserve_disclosure")
      Object.assign(data, { corporate_action_reserve_fully_unopened: true });
    if (kind === "policy_count") Object.assign(data.results.jev, { entries: 11, open_trades: 1 });
    if (kind === "source_metadata") Object.assign(data.source, { provider: "Alpaca" });
    if (kind === "attribution") Object.assign(data.source, { attribution: "No attribution" });
    if (kind === "early_date") data.audit[0].signal_date = "2022-05-31";
    if (kind === "post_cutoff") data.audit[0].signal_date = "2024-12-02";
    expect(evidenceSchema.safeParse(data).success).toBe(false);
  });
  test("reconciles filters, excludes open positions and bounds URL state", () => {
    const trades = completedTrades(syntheticEvidence());
    expect(trades).toHaveLength(34);
    expect(trades.filter((event) => matchesFilter(event, "skipped"))).toHaveLength(24);
    expect(trades.filter((event) => matchesFilter(event, "taken"))).toHaveLength(10);
    expect(trades.filter((event) => matchesFilter(event, "missed_winners"))).toHaveLength(10);
    expect(trades.filter((event) => matchesFilter(event, "avoided_losses"))).toHaveLength(14);
    expect(matchesFilter(syntheticEvidence().audit[36], "all")).toBe(false);
    expect(parseView("arbitrary")).toBe("comparison");
    expect(parseFilter("arbitrary")).toBe("all");
    expect(pct(-0.125)).toBe("−12.50%");
  });
});
