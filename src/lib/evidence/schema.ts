import { z } from "zod";

export const policyIds = ["crossover", "rule_filter", "jev", "buy_hold"] as const;
export type PolicyId = (typeof policyIds)[number];
export const policyNames: Record<PolicyId, string> = {
  crossover: "Unfiltered",
  rule_filter: "Rule filter",
  jev: "With Jev",
  buy_hold: "Buy & hold",
};
export const sourceDigests = {
  "comparison.json": "303206e8c5c5a42f3379a220f5eb3f6d453ae87db2e438173a0f17df699a6128",
  "decision-audit.json": "c0db6ba2f540334d960d8e975e59cb55fb20e90bdc22d7d4ccb33ca831960e56",
} as const;

const finite = z.number().finite();
const developmentDate = z.iso
  .date()
  .refine((value) => value >= "2022-06-01" && value <= "2024-11-29", "Outside development period");
const metricsSchema = z
  .strictObject({
    total_return: finite,
    cagr: finite,
    sharpe_252_zero_rf: finite,
    sortino_252_zero_mar: finite,
    max_drawdown_daily_close: finite.min(-1).max(0),
    final_equity_usd: finite.positive(),
    entries: z.number().int().nonnegative(),
    completed_trades: z.number().int().nonnegative(),
    open_trades: z.number().int().nonnegative(),
    completed_trade_win_rate: finite.min(0).max(1).nullable(),
    modeled_cost_usd: finite.nonnegative(),
    gross_traded_notional_usd: finite.nonnegative(),
    annualized_one_way_turnover: finite.nonnegative(),
    mean_close_invested_fraction: finite.min(0).max(1),
    annual_returns: z.strictObject({
      "2022": finite,
      "2023": finite,
      "2024": finite,
    }),
  })
  .refine((m) => m.entries === m.completed_trades + m.open_trades, "Trade counts do not reconcile")
  .refine(
    (m) => Math.abs(m.final_equity_usd / 100000 - 1 - m.total_return) < 1e-8,
    "Equity/return mismatch",
  );

const policiesSchema = z.strictObject({
  crossover: metricsSchema,
  rule_filter: metricsSchema,
  jev: metricsSchema,
  buy_hold: metricsSchema,
});

export const eventSchema = z
  .strictObject({
    event_id: z.string().regex(/^[a-f0-9]{16}$/),
    symbol: z.enum(["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL"]),
    signal_date: developmentDate,
    entry_date: developmentDate,
    rule_accept: z.boolean(),
    jev_accept: z.boolean(),
    reversed_order_accept: z.boolean(),
    trend_choice: z.enum(["supported", "mixed", "fragile"]),
    risk_choice: z.enum(["manageable", "uncertain", "stressed"]),
    baseline_exit_date: developmentDate.nullable(),
    baseline_net_trade_return: finite.min(-1).nullable(),
  })
  .refine((e) => e.entry_date > e.signal_date, "Entry must follow signal")
  .refine(
    (e) => (e.baseline_exit_date === null) === (e.baseline_net_trade_return === null),
    "Incomplete exit/outcome",
  )
  .refine(
    (e) => e.baseline_exit_date === null || e.baseline_exit_date >= e.entry_date,
    "Exit before entry",
  )
  .refine(
    (e) => !e.jev_accept || (e.trend_choice === "supported" && e.risk_choice === "manageable"),
    "Admission conflicts with labels",
  );

const diagnosticSchema = z.strictObject({
  ex_post_not_investable: z.literal(true),
  constant_daily_return_scale: finite.min(0).max(1),
  total_return: finite,
  sharpe: finite,
  sortino: finite,
  max_drawdown: finite.min(-1).max(0),
});

export const evidenceSchema = z
  .strictObject({
    version: z.literal("edison-evidence-v2"),
    source_hashes: z.record(z.string(), z.string().regex(/^[a-f0-9]{64}$/)),
    period: z.strictObject({
      start: z.literal("2022-06-01"),
      end: z.literal("2024-11-29"),
      layer: z.literal("IEX-only native-stock development"),
    }),
    source: z.strictObject({
      provider: z.literal("HF Data Library"),
      venue: z.literal("IEX-only"),
      version: z.literal("raw 1-minute bars"),
      license: z.literal("CC BY 4.0 compilation/documentation"),
      attribution: z.literal(
        "Data provided for free by IEX. By accessing or using IEX Historical Data, you agree to the IEX Historical Data Terms of Use.",
      ),
    }),
    cost_bps_per_side: z.literal(10),
    results: policiesSchema,
    cost_scenarios: z.strictObject({
      "0": policiesSchema,
      "5": policiesSchema,
      "10": policiesSchema,
      "20": policiesSchema,
    }),
    audit: z.array(eventSchema).length(37),
    featured_event_ids: z.array(z.string().regex(/^[a-f0-9]{16}$/)).length(2),
    equity: z
      .array(
        z.strictObject({
          date: developmentDate,
          crossover: finite.positive(),
          rule_filter: finite.positive(),
          jev: finite.positive(),
          buy_hold: finite.positive(),
        }),
      )
      .length(31),
    gate_checks: z.strictObject({
      healthy_complete_run: z.literal(true),
      option_order_stable: z.literal(true),
      at_least_20_completed: z.literal(false),
      sharpe_beats_both: z.literal(false),
      cagr_at_least_crossover: z.literal(false),
      drawdown_no_worse_than_both: z.literal(true),
    }),
    api: z.strictObject({
      calls: z.literal(74),
      reported_cost: z.literal("0"),
      valid_responses: z.literal(74),
      option_order_admission_disagreements: z.literal(0),
      option_order_admission_disagreement_fraction: z.literal(0),
      median_latency_seconds: finite.nonnegative(),
    }),
    ex_post_exposure_diagnostics: z.strictObject({
      rule_filter: diagnosticSchema,
      jev: diagnosticSchema,
    }),
    advance_gate_passed: z.literal(false),
    market_price_reserve_read: z.literal(false),
    corporate_action_reserve_fully_unopened: z.literal(false),
  })
  .superRefine((data, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: "custom", message });
    for (const [name, digest] of Object.entries(sourceDigests))
      if (data.source_hashes[name] !== digest) fail("Frozen source digest mismatch");
    if (new Set(data.audit.map((e) => e.event_id)).size !== 37) fail("Duplicate events");
    const completed = data.audit.filter((e) => e.baseline_net_trade_return !== null);
    if (
      completed.length !== 34 ||
      data.audit.filter((e) => e.jev_accept).length !== 10 ||
      data.audit.filter((e) => e.rule_accept).length !== 13
    )
      fail("Frozen event counts mismatch");
    if (data.audit.some((e) => e.jev_accept !== e.reversed_order_accept))
      fail("Option-order disagreement");
    if (data.featured_event_ids.some((id) => !completed.some((e) => e.event_id === id)))
      fail("Unknown featured event");
    if (new Set(data.featured_event_ids).size !== 2) fail("Duplicate featured events");
    if (data.equity.some((row, i) => i > 0 && row.date <= data.equity[i - 1].date))
      fail("Equity dates not ordered");
    if (data.equity[0].date !== "2022-06-01" || data.equity.at(-1)?.date !== "2024-11-29")
      fail("Equity period mismatch");
    for (const policy of policyIds) {
      const admits = (event: ResearchEvent) =>
        policy === "crossover" || (policy === "jev" ? event.jev_accept : event.rule_accept);
      const expectedEntries = policy === "buy_hold" ? 5 : data.audit.filter(admits).length;
      const expectedCompleted = policy === "buy_hold" ? 0 : completed.filter(admits).length;
      if (
        data.results[policy].entries !== expectedEntries ||
        data.results[policy].completed_trades !== expectedCompleted
      )
        fail("Policy counts do not match recorded admissions");
      if (Math.abs(data.equity.at(-1)![policy] - data.results[policy].final_equity_usd) > 1e-6)
        fail("Equity endpoint mismatch");
      if (
        JSON.stringify(data.cost_scenarios["10"][policy]) !== JSON.stringify(data.results[policy])
      )
        fail("Primary scenario mismatch");
      for (const cost of ["0", "5", "10", "20"] as const) {
        const metrics = data.cost_scenarios[cost][policy];
        if (metrics.entries !== data.results[policy].entries) fail("Cost changed entries");
        if (
          Math.abs(
            metrics.modeled_cost_usd - (metrics.gross_traded_notional_usd * Number(cost)) / 10000,
          ) > 1e-6
        )
          fail("Modeled costs do not reconcile");
      }
    }
    const counts = [
      [false, false, 14],
      [false, true, 10],
      [true, false, 6],
      [true, true, 4],
    ] as const;
    for (const [taken, winner, count] of counts)
      if (
        completed.filter(
          (e) => e.jev_accept === taken && e.baseline_net_trade_return! > 0 === winner,
        ).length !== count
      )
        fail("Outcome distribution mismatch");
  });

export type Evidence = z.infer<typeof evidenceSchema>;
export type ResearchEvent = z.infer<typeof eventSchema>;
export type PolicyMetrics = Evidence["results"][PolicyId];
export type EvidenceState =
  | { status: "available"; evidence: Evidence; publicationApproved: boolean }
  | { status: "unavailable"; reason: "withheld" | "missing" | "invalid" };
