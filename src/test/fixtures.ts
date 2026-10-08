import {
  sourceDigests,
  type Evidence,
  type PolicyMetrics,
  type ResearchEvent,
} from "@/lib/evidence/schema";

// Synthetic unit input only. Never imported by application routes or used as a fallback.
export function syntheticEvidence(): Evidence {
  const audit: ResearchEvent[] = Array.from({ length: 37 }, (_, i) => {
    const completed = i < 34;
    const admitted = i >= 24 && i < 34;
    const winner = (i >= 14 && i < 24) || (i >= 30 && i < 34);
    const day = (offset: number) =>
      new Date(Date.UTC(2022, 5, 1 + i * 20 + offset)).toISOString().slice(0, 10);
    return {
      event_id: (i + 1).toString(16).padStart(16, "0"),
      symbol: (["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL"] as const)[i % 5],
      signal_date: day(0),
      entry_date: day(1),
      rule_accept: i < 13,
      jev_accept: admitted,
      reversed_order_accept: admitted,
      trend_choice: admitted ? "supported" : "mixed",
      risk_choice: admitted ? "manageable" : "stressed",
      baseline_exit_date: completed ? day(10) : null,
      baseline_net_trade_return: completed ? (winner ? 0.05 : -0.04) : null,
    };
  });
  function metrics(entries: number, completed: number, cost: number): PolicyMetrics {
    return {
      total_return: 0.1,
      cagr: Math.pow(1.1, 1 / 4) - 1,
      sharpe_252_zero_rf: 0.5,
      sortino_252_zero_mar: 0.6,
      max_drawdown_daily_close: -0.1,
      final_equity_usd: 110000,
      entries,
      completed_trades: completed,
      open_trades: entries - completed,
      completed_trade_win_rate: completed ? 0.4 : null,
      modeled_cost_usd: (100000 * cost) / 10000,
      gross_traded_notional_usd: 100000,
      annualized_one_way_turnover: 0.25,
      mean_close_invested_fraction: 0.3,
      annual_returns: { "2022": 0.01, "2023": 0.01, "2024": 0.01 },
    };
  }
  function policies(cost: number) {
    return {
      crossover: metrics(37, 34, cost),
      rule_filter: metrics(13, 13, cost),
      jev: metrics(10, 10, cost),
      buy_hold: metrics(5, 0, cost),
    };
  }
  const diagnostic = {
    ex_post_not_investable: true as const,
    constant_daily_return_scale: 0.5,
    total_return: 0.08,
    sharpe: 0.5,
    sortino: 0.6,
    max_drawdown: -0.06,
  };
  return {
    version: "edison-evidence-v2",
    source_hashes: { ...sourceDigests },
    period: { start: "2022-06-01", end: "2024-11-29", layer: "IEX-only native-stock development" },
    source: {
      provider: "HF Data Library",
      venue: "IEX-only",
      version: "raw 1-minute bars",
      license: "CC BY 4.0 compilation/documentation",
      attribution:
        "Data provided for free by IEX. By accessing or using IEX Historical Data, you agree to the IEX Historical Data Terms of Use.",
    },
    cost_bps_per_side: 10,
    results: policies(10),
    cost_scenarios: { "0": policies(0), "5": policies(5), "10": policies(10), "20": policies(20) },
    audit,
    featured_event_ids: [audit[14].event_id, audit[0].event_id],
    equity: Array.from({ length: 31 }, (_, i) => ({
      date:
        i === 0
          ? "2022-06-01"
          : i === 30
            ? "2024-11-29"
            : new Date(Date.UTC(2022, i + 5, 0)).toISOString().slice(0, 10),
      crossover: 100000 + (10000 * i) / 30,
      jev: 100000 + (10000 * i) / 30,
      rule_filter: 100000 + (10000 * i) / 30,
      buy_hold: 100000 + (10000 * i) / 30,
    })),
    gate_checks: {
      healthy_complete_run: true,
      option_order_stable: true,
      at_least_20_completed: false,
      sharpe_beats_both: false,
      cagr_at_least_crossover: false,
      drawdown_no_worse_than_both: true,
    },
    api: {
      calls: 74,
      reported_cost: "0",
      valid_responses: 74,
      option_order_admission_disagreements: 0,
      option_order_admission_disagreement_fraction: 0,
      median_latency_seconds: 0.3,
    },
    ex_post_exposure_diagnostics: { rule_filter: { ...diagnostic }, jev: { ...diagnostic } },
    advance_gate_passed: false,
    market_price_reserve_read: false,
    corporate_action_reserve_fully_unopened: false,
  };
}
