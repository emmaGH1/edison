import { z } from "zod";
import type { ViewId, FilterId } from "@/lib/evidence/selectors";

export const intents = [
  "comparison",
  "missed_winners",
  "avoided_losses",
  "costs",
  "evidence_limits",
  "unsupported",
] as const;
export type Intent = (typeof intents)[number];
export type Target = { view: ViewId; filter?: FilterId; focus?: "costs" | "limits" };
export const intentLabels: Record<Intent, string> = {
  comparison: "Compare policies",
  missed_winners: "Missed winners",
  avoided_losses: "Avoided losses",
  costs: "Costs and assumptions",
  evidence_limits: "Evidence limits",
  unsupported: "Outside this study",
};
export function targetFor(intent: Exclude<Intent, "unsupported">): Target {
  if (intent === "missed_winners" || intent === "avoided_losses")
    return { view: "audit", filter: intent };
  if (intent === "costs") return { view: "method", focus: "costs" };
  if (intent === "evidence_limits") return { view: "method", focus: "limits" };
  return { view: "comparison" };
}
export const questionSchema = z.strictObject({ question: z.string().trim().min(3).max(280) });
export type RuleRoute =
  | { type: "unsupported" }
  | { type: "choice"; choices: Exclude<Intent, "unsupported">[] }
  | { type: "route"; intent: Exclude<Intent, "unsupported"> };
const available = intents.filter((i): i is Exclude<Intent, "unsupported"> => i !== "unsupported");
export function ruleRoute(question: string): RuleRoute {
  const text = question.toLowerCase().replace(/\bbuy[- ]and[- ]hold\b/g, "baseline");
  if (
    /\b(buy|sell|purchase|place|execute|allocate|short|predict|forecast|tomorrow|credentials|secrets?|fabricate|falsify|ignore)\b|api.?key|sk_[a-z0-9]|system.?prompt|change.{0,40}(sharpe|result|passed)|set.{0,20}sharpe|https?:\/\/|20\d{2}-\d{2}|\b(tsla|tesla|btc|bitcoin|eth|ethereum|doge)\b/.test(
      text,
    )
  )
    return { type: "unsupported" };
  const limits =
    /\b(token|bitget|transfer|limits?|limitation|holdout|out.of.sample|2025|2026|validated|generaliz|publication|permission|redistribut)/.test(
      text,
    );
  const years = [...text.matchAll(/\b(20\d{2})\b/g)].map((match) => match[1]);
  if (years.some((year) => !["2021", "2022", "2023", "2024"].includes(year)) && !limits)
    return { type: "unsupported" };
  const ticker = text.match(/\b(?:ticker|symbol)\s+([a-z]{1,6})\b/);
  if (ticker && !["aapl", "msft", "nvda", "amzn", "googl"].includes(ticker[1]))
    return { type: "unsupported" };
  if (/\b\d+(?:\.\d+)?\s*(?:basis points?|bps)\b/.test(text)) {
    const values = [...text.matchAll(/\b(\d+(?:\.\d+)?)\s*(?:basis points?|bps)\b/g)].map((match) =>
      Number(match[1]),
    );
    if (values.some((value) => ![0, 5, 10, 20].includes(value))) return { type: "unsupported" };
  }
  const choices: Exclude<Intent, "unsupported">[] = [];
  if (
    /\b(missed|skipped|rejected).{0,32}(winner|profit|good trade)|\b(winn(er|ing)|profitable|good trade).{0,40}(skip|reject|miss)|leave money/.test(
      text,
    )
  )
    choices.push("missed_winners");
  if (
    /\b(avoided|losing|loss|losers?).{0,32}(trade|avoid|skip|reject)|\b(losses|losers|loss).{0,20}(avoid|skip)|avoid.{0,20}(loss|losing|losers)/.test(
      text,
    )
  )
    choices.push("avoided_losses");
  if (/\b(cost|costs|fees?|slippage|spread|basis points|bps)\b/.test(text)) choices.push("costs");
  if (limits) choices.push("evidence_limits");
  if (choices.length > 1) return { type: "choice", choices };
  if (choices.length === 1) return { type: "route", intent: choices[0] };
  if (
    /\b(compare|comparison|improve|improved|help|helped|better|drawdown|sharpe|cagr|risk|return|returns|cash|exposure|rule filter|trade less|traded less|give up)\b/.test(
      text,
    )
  )
    return { type: "route", intent: "comparison" };
  return { type: "choice", choices: available };
}
export const routeResultSchema = z.discriminatedUnion("type", [
  z.strictObject({
    type: z.literal("route"),
    intent: z.enum(["comparison", "missed_winners", "avoided_losses", "costs", "evidence_limits"]),
    engine: z.enum(["rules", "jev", "fallback"]),
  }),
  z.strictObject({
    type: z.literal("choice"),
    choices: z
      .array(z.enum(["comparison", "missed_winners", "avoided_losses", "costs", "evidence_limits"]))
      .min(1)
      .max(5),
    reason: z.enum(["ambiguous", "low_confidence"]),
  }),
  z.strictObject({ type: z.literal("unsupported") }),
]);
export type RouteResult = z.infer<typeof routeResultSchema>;
