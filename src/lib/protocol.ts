export const researchSources = [
  {
    label: "HF Data Library methodology",
    url: "https://hfdatalibrary.com/pages/docs",
  },
  {
    label: "HF Data Library · CC BY 4.0 license",
    url: "https://hfdatalibrary.com/pages/license",
  },
  { label: "HF Data Library citation", url: "https://hfdatalibrary.com/pages/cite" },
  { label: "IEX Historical Data Terms of Use", url: "https://www.iex.io/legal/hist-data-terms" },
  { label: "Apple dividend history", url: "https://investor.apple.com/dividend-history/" },
  {
    label: "Microsoft dividend history",
    url: "https://www.microsoft.com/en-us/investor/dividends-and-stock-history",
  },
  {
    label: "NVIDIA dividend announcements",
    url: "https://investor.nvidia.com/search-results/default.aspx?searchterm=dividends",
  },
  { label: "Alphabet investor relations", url: "https://abc.xyz/investor/" },
  { label: "Jev via OpenCode Zen", url: "https://opencode.ai/docs/zen/#jev" },
  { label: "Jev model limitations", url: "https://docs.typesafe.ai/model-jaggedness/jev-1.13" },
  {
    label: "Bitget symbol constraints",
    url: "https://www.bitget.com/api-doc/classic/spot/market/Get-Symbols",
  },
] as const;
export const assumptions = [
  "Fixed AAPL, MSFT, NVDA, AMZN, GOOGL survivor-selected basket. IEX-only native-stock development: June 1, 2022–November 29, 2024; warm-up from March 7, 2022.",
  "20/50-session price-only crossover, initially flat. Rejected entries remain cash until a fresh upward crossover; no within-episode re-entry.",
  "$100,000 initial capital, five independent $20,000 sleeves, fractional shares, no transfers/leverage/shorts; cash earns zero.",
  "Next-session fill reference: first observed IEX minute-bar open in [10:05, 10:10) New York. Hypothetical, not observed orders or consolidated quotes. Missing required intervals block the run.",
  "Daily marking uses the final valid IEX trade bar before the scheduled close, within five minutes—not the official auction close. Vendor split-adjusted units, separately sourced earned dividends and receivables; no second split adjustment or forced liquidation at cutoff.",
  "All-in adverse transaction-cost scenarios: 0/5/10/20 bps per side; 10 bps primary. Not verified historical account rates. No arbitrary interpolation.",
  "CAGR uses calendar span; daily Sharpe uses 252 sessions and zero risk-free rate. Drawdown is daily-close, not intraday.",
] as const;
export const evidenceLimits = [
  "Development evidence, not an independent out-of-sample result or demonstrated trading edge.",
  "Native-stock findings do not establish token performance, fills, liquidity, redemption rights or corporate-action equivalence.",
  "IEX-only bars represent about 2–3% of consolidated volume. Missing IEX trades, venue-specific prices and partial coverage limit execution claims. Raw bars avoid the provider's future-dependent centered cleaning filter.",
  "Full files were privately acquired by approved blind extraction; only March 2022–November 2024 rows reach research. No 2025 prices, fills or outcomes were read or used. September–October 2026 token data remains unopened.",
  "Post-cutoff Microsoft and Apple dividend rows were displayed during official-source checking and quarantined unused. The corporate-action reserve was not completely unopened. Retrospective reserves do not eliminate model training-data contamination.",
  "Prior pilot investigations informed choices. Concentrated survivor-selected universe and small event-dependent samples limit generalization.",
  "Jev and the simple rule use different features. The comparison does not isolate model intelligence from feature selection.",
  "Costs are assumptions; taxes, market impact and liquidity capacity are not established.",
  "Selected episodes are hindsight illustrations. Portfolio equity includes open positions; the completed-trade distribution does not.",
  "Publication requires documented permission. A research note is not a full reproducible backtest or raw-data archive.",
] as const;
export const dataAttribution =
  "Data provided for free by IEX. By accessing or using IEX Historical Data, you agree to the IEX Historical Data Terms of Use.";
export const hfCitation =
  "Elkassabgi, Ahmed. 2026. HF Data Library: High-Frequency U.S. Equity Data (1-Minute OHLCV). Accessed October 7, 2026. CC BY 4.0. Edison filters the approved dates, aggregates IEX bars and computes hypothetical research outputs.";
