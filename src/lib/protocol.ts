export const researchSources = [
  {
    label: "Alpaca market-data documentation",
    url: "https://docs.alpaca.markets/docs/about-market-data-api",
  },
  {
    label: "Alpaca redistribution policy",
    url: "https://alpaca.markets/support/redistribute-alpaca-api",
  },
  { label: "Jev via OpenCode Zen", url: "https://opencode.ai/docs/zen/#jev" },
  { label: "Jev model limitations", url: "https://docs.typesafe.ai/model-jaggedness/jev-1.13" },
  {
    label: "Bitget symbol constraints",
    url: "https://www.bitget.com/api-doc/classic/spot/market/Get-Symbols",
  },
] as const;
export const assumptions = [
  "Fixed AAPL, MSFT, NVDA, AMZN, GOOGL survivor-selected basket. Native-stock development: 2021–2024; warm-up from October 2020.",
  "20/50-session price-only crossover, initially flat. Rejected entries remain cash until a fresh upward crossover; no within-episode re-entry.",
  "$100,000 initial capital, five independent $20,000 sleeves, fractional shares, no transfers/leverage/shorts; cash earns zero.",
  "Next-session 10:05 New York five-minute bar-open fills are hypothetical, not observed orders or quotes. Missing required bars block the run.",
  "Daily official-close marking; point-in-time splits, earned cash dividends and receivables. No forced liquidation at cutoff.",
  "All-in adverse transaction-cost scenarios: 0/5/10/20 bps per side; 10 bps primary. Not verified historical account rates. No arbitrary interpolation.",
  "CAGR uses calendar span; daily Sharpe uses 252 sessions and zero risk-free rate. Drawdown is daily-close, not intraday.",
] as const;
export const evidenceLimits = [
  "Development evidence, not an independent out-of-sample result or demonstrated trading edge.",
  "Native-stock findings do not establish token performance, fills, liquidity, redemption rights or corporate-action equivalence.",
  "Native 2025 and September–October 2026 token reserves remain unopened. A retrospective reserve does not rule out model training-data contamination.",
  "Prior pilot investigations informed choices. Concentrated survivor-selected universe and small event-dependent samples limit generalization.",
  "Jev and the simple rule use different features. The comparison does not isolate model intelligence from feature selection.",
  "Costs are assumptions; taxes, market impact and liquidity capacity are not established.",
  "Selected episodes are hindsight illustrations. Portfolio equity includes open positions; the completed-trade distribution does not.",
  "Publication requires documented permission. A research note is not a full reproducible backtest or raw-data archive.",
] as const;
