import type { Evidence, ResearchEvent } from "./schema";

export const viewIds = ["comparison", "audit", "method"] as const;
export type ViewId = (typeof viewIds)[number];
export const filterIds = ["all", "skipped", "taken", "missed_winners", "avoided_losses"] as const;
export type FilterId = (typeof filterIds)[number];

export function parseView(value: string | null | undefined): ViewId {
  return viewIds.find((v) => v === value) ?? "comparison";
}
export function parseFilter(value: string | null | undefined): FilterId {
  return filterIds.find((f) => f === value) ?? "all";
}
export function completedTrades(evidence: Evidence) {
  return evidence.audit
    .filter((e) => e.baseline_net_trade_return !== null)
    .sort(
      (a, b) => a.signal_date.localeCompare(b.signal_date) || a.event_id.localeCompare(b.event_id),
    );
}
export function matchesFilter(event: ResearchEvent, filter: FilterId) {
  if (event.baseline_net_trade_return === null) return false;
  switch (filter) {
    case "skipped":
      return !event.jev_accept;
    case "taken":
      return event.jev_accept;
    case "missed_winners":
      return !event.jev_accept && event.baseline_net_trade_return > 0;
    case "avoided_losses":
      return !event.jev_accept && event.baseline_net_trade_return < 0;
    default:
      return true;
  }
}
export function outcomeLabel(event: ResearchEvent) {
  if (event.baseline_net_trade_return === null) return "Open at cutoff";
  const winner = event.baseline_net_trade_return > 0;
  return event.jev_accept
    ? winner
      ? "Kept winner"
      : "Kept loss"
    : winner
      ? "Missed winner"
      : "Avoided loss";
}
export const pct = (value: number, sign = false) =>
  `${sign && value > 0 ? "+" : ""}${(value * 100).toFixed(2)}%`.replace("-", "−");
export const money = (value: number, digits = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
export const dateLabel = (date: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
