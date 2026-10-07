# Research protocol and limits

Fixed survivor-selected technology basket: AAPL, MSFT, NVDA, AMZN, GOOGL. Warm-up from October 1, 2020; development January 1, 2021–December 31, 2024. Native 2025 and September 1–October 5, 2026 token reserves remain unopened. Prior pilot investigations informed research choices; this is not a pristine independent experiment.

## Deterministic strategy

Use completed NASDAQ official closes and 20/50-session simple moving averages, initially flat. Enter when fast > slow and previous fast <= slow; exit when fast < slow and previous fast >= slow. Rejected entries stay cash until a fresh upward cross. No re-entry within the same bullish episode.

Rule filter: admit when the 50-session mean's five-session slope is positive and 20-session volatility <= 60-session volatility. Jev: trend `supported`, volatility `manageable`, both classification confidences >=0.70. Classification confidence is not probability of profit.

Jev received anonymous pre-entry features, not ticker/date/absolute price/future outcome. Historical training contamination remains possible. The simple rule uses fewer features; the comparison does not isolate model intelligence from feature selection.

## Accounting

$100,000 initial capital, five independent $20,000 sleeves, fractional shares, long-only, no leverage/transfers; cash earns zero. Next-session 10:05 New York five-minute bar-open fills are hypothetical, not quotes or observed orders. Missing required bars block a run. Daily official-close marking; point-in-time split adjustment; earned dividends/receivables included, payments available only on payment date. No forced liquidation at cutoff.

All-in adverse modeled cost per side: 0/5/10/20 bps, 10 primary. Combines fee/spread/slippage assumptions, not historical account entitlements. Taxes, impact and liquidity capacity unestablished. Same-basket buy-and-hold uses the same data/corporate-action/cost assumptions but does not match strategy exposure.

CAGR uses calendar span. Sharpe uses daily returns, 252 sessions and zero risk-free rate; Sortino uses zero minimum acceptable return. Drawdown uses daily closes, not intraday extremes. Completed-trade outcomes exclude open positions, while portfolio equity includes them.

Ex-post exposure-scaled crossover multiplies daily returns by the ratio of mean invested fractions. It is not investable, not a daily exposure match and not causal evidence.

Advancement requires complete/stable calls, >=20 completed Jev positions, Sharpe above both filters, CAGR >= unfiltered and drawdown no worse than both. These are engineering gates, not significance tests. Never change a failed outcome by further tuning.

## Reproducibility and publication

The importer checks the frozen comparison/audit digests and aligns month-end observations to their endpoints. The app inspects captured results; it does not rerun the research engine. Research notes cannot reproduce the full backtest without the separately licensed source data and research implementation. Raw bars, private captures and derived bundles are excluded from Git pending rights.

Sources: [Alpaca](https://docs.alpaca.markets/docs/about-market-data-api), [redistribution boundary](https://alpaca.markets/support/redistribute-alpaca-api), [Jev/OpenCode](https://opencode.ai/docs/zen/#jev), [Jev limitations](https://docs.typesafe.ai/model-jaggedness/jev-1.13), [Bitget symbols](https://www.bitget.com/api-doc/classic/spot/market/Get-Symbols).
