import { policyIds, policyNames, type Evidence } from "./schema";
import { money, pct, type FilterId, type ViewId } from "./selectors";
import { assumptions, evidenceLimits, researchSources } from "@/lib/protocol";

export function buildResearchNote({
  view,
  filter,
  evidence,
  eventId,
  generatedAt,
}: {
  view: ViewId;
  filter: FilterId;
  evidence: Evidence | null;
  eventId?: string;
  generatedAt: string;
}) {
  const lines = [
    "# Edison — research note",
    "",
    "Generated: " + generatedAt,
    "Selected view: " + view,
    "Selected filter: " + filter,
    "",
    "## Publication boundary",
    evidence
      ? "Permitted derived research summary. No raw captures or market-data archive."
      : "Method-only. Evidence publication is withheld; no derived metrics, trade events or equity values are exported.",
    "",
    "## Research question",
    "Did AI improve this strategy—or just trade less?",
    "",
    "## Frozen protocol and assumptions",
    ...assumptions.map((item) => "- " + item),
    "",
    "Jev entry gate: supported trend, manageable risk and both classification confidences >=0.70. Rejected entries remain cash until a fresh upward cross.",
    "Simple rule: positive five-session slope of the 50-session mean and 20-session volatility <=60-session volatility.",
    "",
    "## Evidence limits",
    ...evidenceLimits.map((item) => "- " + item),
    "",
    "## Sources",
    ...researchSources.map((source) => "- " + source.label + ": " + source.url),
    "",
    "## Human decision",
    "Further independent testing is a human research decision. This note is not investment advice, a trading instruction or proof of an edge.",
  ];
  if (evidence) {
    lines.push(
      "",
      "## Captured development comparison",
      "Primary all-in modeled cost: 10 bps per side.",
      "Advancement gate: failed. Jev did not meet the CAGR and Sharpe thresholds.",
      "",
      "| Policy | CAGR | Drawdown | Sharpe | Exposure | Entries | Cost |",
      "|---|---:|---:|---:|---:|---:|---:|",
    );
    for (const policy of policyIds) {
      const m = evidence.results[policy];
      lines.push(
        "| " +
          [
            policyNames[policy],
            pct(m.cagr, true),
            pct(m.max_drawdown_daily_close),
            m.sharpe_252_zero_rf.toFixed(3),
            pct(m.mean_close_invested_fraction),
            m.entries,
            money(m.modeled_cost_usd, 2),
          ].join(" | ") +
          " |",
      );
    }
    const event = evidence.audit.find(
      (row) => row.event_id === eventId && row.baseline_net_trade_return !== null,
    );
    if (event)
      lines.push(
        "",
        "## Selected event",
        "Event ID: " + event.event_id,
        "Stock: " + event.symbol,
        "Signal / hypothetical entry / baseline exit: " +
          [event.signal_date, event.entry_date, event.baseline_exit_date].join(" / "),
        "Jev: " +
          (event.jev_accept ? "admitted" : "skipped") +
          "; trend " +
          event.trend_choice +
          "; risk " +
          event.risk_choice,
        "Net hypothetical baseline-trade return: " + pct(event.baseline_net_trade_return!, true),
        "Hindsight-selected episodes are illustrative; skipped baseline returns were not earned by Jev.",
      );
    lines.push(
      "",
      "## Source integrity receipts",
      ...Object.entries(evidence.source_hashes).map(
        ([name, digest]) => "- " + name + ": SHA-256 " + digest,
      ),
    );
  }
  return lines.join("\n") + "\n";
}
