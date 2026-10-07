# Research protocol and limits

Fixed survivor-selected technology basket: AAPL, MSFT, NVDA, AMZN, GOOGL. Warm-up from March 7, 2022; development June 1, 2022–November 29, 2024. The source is HF Data Library raw IEX-derived minute bars, not consolidated-market activity. IEX accounts for about 2–3% of consolidated volume. Prior pilot investigations informed research choices; this is not a pristine independent experiment.

Emma approved full-file blind extraction because HF ignores API date parameters. Sealed files remain private. The research runner sees only March 2022–November 2024 rows. No 2025 market price, fill or outcome was read or used; token reserves remain unopened. A MSFT FY2025 dividend row was displayed during source filtering before the performance run; Apple's current dividend page also surfaced post-cutoff action rows during post-run source checking. All are quarantined unused. The corporate-action reserve was therefore not completely unopened. No question, strategy or performance parameter was changed from these disclosures.

## Deterministic strategy

Use the final valid IEX trade bar before each scheduled session close, within five minutes, and 20/50-session simple moving averages, initially flat. These are venue-specific close proxies, not NASDAQ official auction closes. Enter when fast > slow and previous fast <= slow; exit when fast < slow and previous fast >= slow. Rejected entries stay cash until a fresh upward cross. No re-entry within the same bullish episode. Provider-clean data is excluded because its centered 50-bar filter uses future observations.

Rule filter: admit when the 50-session mean's five-session slope is positive and 20-session volatility <= 60-session volatility. Jev: trend `supported`, volatility `manageable`, both classification confidences >=0.70. Classification confidence is not probability of profit.

Jev received anonymous pre-entry features, not ticker/date/absolute price/future outcome. Historical training contamination remains possible. The simple rule uses fewer features; the comparison does not isolate model intelligence from feature selection.

## Accounting

$100,000 initial capital, five independent $20,000 sleeves, fractional vendor-normalized units, long-only, no leverage/transfers; cash earns zero. Next-session fill reference is the first observed IEX minute-bar open in [10:05, 10:10) New York. These hypothetical fills are not consolidated quotes or observed orders. Missing required intervals block a run. Daily marking uses the IEX close proxy. Vendor prices are split-adjusted only; never double-apply splits. Issuer-sourced cash dividends are translated to the same units, earned on ex-date and included as receivables until cash payment. No forced liquidation at cutoff.

All-in adverse modeled cost per side: 0/5/10/20 bps, 10 primary. Combines fee/spread/slippage assumptions, not historical account entitlements. Taxes, impact and liquidity capacity unestablished. Same-basket buy-and-hold uses the same data/corporate-action/cost assumptions but does not match strategy exposure.

CAGR uses calendar span. Sharpe uses daily returns, 252 sessions and zero risk-free rate; Sortino uses zero minimum acceptable return. Drawdown uses daily closes, not intraday extremes. Completed-trade outcomes exclude open positions, while portfolio equity includes them.

Ex-post exposure-scaled crossover multiplies daily returns by the ratio of mean invested fractions. It is not investable, not a daily exposure match and not causal evidence.

Advancement requires complete/stable calls, >=20 completed Jev positions, Sharpe above both filters, CAGR >= unfiltered and drawdown no worse than both. These are engineering gates, not significance tests. Never change a failed outcome by further tuning.

## Reproducibility and publication

The event set, questions and performance method were frozen before new outcomes/model calls. The importer checks validated comparison/audit and daily-run digests, then aligns 31 first-session/month-end observations to their endpoints. The app inspects captured results; it does not rerun the research engine. Notes cannot reproduce the full backtest without source data and the separate research implementation. Raw bars, private captures and derived bundles remain excluded from Git.

HF's compilation/documentation is CC BY 4.0; IEX retains rights in its underlying information. Attribution, license/terms links, author citation and an explanation of transformations appear with the interface/exports. This documents the source route, not Emma's publication/deployment approval. Public production remains withheld until explicitly approved.

Sources: [HF methodology](https://hfdatalibrary.com/pages/docs), [HF license](https://hfdatalibrary.com/pages/license), [HF citation](https://hfdatalibrary.com/pages/cite), [IEX terms](https://www.iex.io/legal/hist-data-terms), [Apple dividends](https://investor.apple.com/dividend-history/), [Microsoft dividends](https://www.microsoft.com/en-us/investor/dividends-and-stock-history), [NVIDIA investor releases](https://investor.nvidia.com/), [Alphabet investor relations](https://abc.xyz/investor/), [Jev/OpenCode](https://opencode.ai/docs/zen/#jev), [Jev limitations](https://docs.typesafe.ai/model-jaggedness/jev-1.13), [Bitget symbols](https://www.bitget.com/api-doc/classic/spot/market/Get-Symbols).
