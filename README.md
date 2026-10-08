# Edison

**See whether AI actually helped.**

Entry for the **Bitget AI Base Camp Hackathon S2 — AI Trading Desk** track.

Most AI trading demos end with a winning backtest and a victory claim. Edison is a research workbench built for the other outcome: it replays one frozen stock strategy with and without a team-recommended AI entry gate, then audits every trade the gate skipped — the missed winners, the avoided losses, the cheaper drawdown — so you can judge whether the AI gate actually improves the strategy or merely reduces market exposure.

In this case, it merely reduced exposure. **The gate failed its advancement criteria, and Edison shows you exactly why, trade by trade.** That honesty is the product: a workbench for auditing AI's contribution to a strategy, not a predictor, investment recommendation or live trading app. Native-stock research is not token-market performance.

## The journey

Ask a question → compare unfiltered, simple-rule-filter, Jev-gated and same-basket buy-and-hold policies → inspect the missed winners and avoided losses behind each summary → check exposure, costs and assumptions → export a permission-aware research note → decide whether further independent testing is justified.

The point is challenging the AI's own answer. Lower drawdown from sitting in cash is not alpha, so Edison surfaces the trades the gate skipped, the winners it missed and the losses it avoided, keeps the ordinary alternatives on screen, and preserves the negative conclusion instead of tuning it away.

## The experiment

The protocol was frozen before any new model calls or outcomes were observed — strategy, dates, questions and advancement criteria were fixed first, then the data was run once. Four policies trade the same basket (AAPL, MSFT, NVDA, AMZN, GOOGL) on the same validated IEX-only minute bars, June 1 – November 29, 2024, with a March 2022 warm-up, $100,000 split into five $20,000 long-only sleeves and modeled costs (0/5/10/20 bps per side; 10 bps primary):

1. **Crossover** — a 20/50-session moving-average crossover, initially flat; the unfiltered baseline.
2. **Rule filter** — admits entries only when the 50-session trend slopes up and volatility is not expanding; a non-AI alternative a practitioner would plausibly try.
3. **Jev gate** — before each entry, the team-recommended Jev model classifies trend and volatility from anonymous pre-entry features (no ticker, date, price level or future outcome); admission requires both classifications at ≥0.70 confidence.
4. **Buy-and-hold** — the same basket, bought and held; the ordinary alternative the gate has to beat to matter.

Advancement required complete, order-stable Jev calls, at least 20 completed gated positions, Sharpe above both alternatives, CAGR at or above the unfiltered crossover, and drawdown no worse than either. These are engineering gates, not statistical significance tests. Fills are hypothetical references to first observed IEX minute-bar opens — not consolidated quotes or observed orders — and the run was not tuned after results were seen.

## The recorded result

| Policy       |   CAGR | Max drawdown (daily close) | Sharpe | Completed positions |
| ------------ | -----: | -------------------------: | -----: | ------------------: |
| Crossover    | 21.17% |                    −25.19% |  1.014 |                  34 |
| Rule filter  |  5.42% |                    −18.04% |  0.464 |                  13 |
| Jev gate     |  1.93% |                    −12.33% |  0.280 |                  10 |
| Buy-and-hold | 49.13% |                    −29.79% |  1.425 |                   0 |

Did AI actually help? **No — Jev failed the advancement gate**: 10 completed positions (fewer than 20), CAGR of 1.93% against the crossover's 21.17%, and Sharpe below both the crossover and the simple rule filter. Of the 34 completed baseline positions, the gate skipped 14 losses and 10 winners and kept 6 losses and 4 winners — hindsight classifications, not outcomes the gate earned by trading them. Its lower drawdown came from lower exposure, not demonstrated judgment. All 74 free Jev calls were valid with no admission disagreements under order reversal, but order stability is not proof of generalization. Buy-and-hold beat every active policy on CAGR and Sharpe. Three crossover positions and the buy-and-hold basket remain open at the cutoff; no forced sale is assumed.

Honest accounting means stating what these numbers are not: not observed account returns, not paid-data or paid-model charges, not consolidated-market results, and not token-market performance. Full protocol, accounting and limits: [docs/RESEARCH.md](docs/RESEARCH.md).

> Data provided for free by IEX. By accessing or using IEX Historical Data, you agree to the [IEX Historical Data Terms of Use](https://www.iex.io/legal/hist-data-terms).

Source: Elkassabgi, Ahmed. 2026. _HF Data Library: High-Frequency U.S. Equity Data (1-Minute OHLCV)_. [DOI: 10.5281/zenodo.19501604](https://doi.org/10.5281/zenodo.19501604). [HF license/citation](https://hfdatalibrary.com/pages/license).

## Evidence, honestly scoped

- One frozen case: AAPL/MSFT/NVDA/AMZN/GOOGL, June 2022–November 2024, IEX-only raw minute bars from the **free HF Data Library** (CC BY 4.0 compilation/documentation; upstream IEX rights and terms apply). No paid data, no paid model fallback.
- IEX-only bars are a venue-specific view (~2–3% of consolidated volume), not consolidated market activity. Fills and close proxies are venue approximations, not official auction closes; gaps in IEX data can represent missing trades, not zero market activity.
- Prices are split-adjusted only; issuer-sourced cash dividends are translated to the same units and accounted for separately. Vendor data carries no guarantee of accuracy and implies no endorsement of Edison.
- A single survivor-selected five-stock development case; prior pilots and possible model-training contamination limit independence. Small dependent samples and lower exposure do not establish AI alpha.
- The old Alpaca-derived development bundle remains private and is never relabeled. Raw captures and runtime bundles stay out of Git. Blind extraction kept reserved 2025 prices/fills/outcomes out of research; the token reserve was never opened.
- Fail-closed publication: committed defaults withhold evidence. An approved runtime must set both server-only flags and privately provision the validated, hash-checked bundle; missing, invalid or unapproved evidence shows the method only — never invented numbers. Partial/invalid provisioned sources never fall back to a valid private file.
- The export is a research note (view, protocol, assumptions, sources, limitations), not a raw archive or an independently reproducible backtest.
- Public use of the derived results is documented with attribution and limitations in the scoped [publication record](docs/PUBLICATION.md).

**Attribution.** Data: [HF Data Library](https://hfdatalibrary.com/pages/license) — Elkassabgi, Ahmed. 2026. _HF Data Library: High-Frequency U.S. Equity Data (1-Minute OHLCV)_, [DOI: 10.5281/zenodo.19501604](https://doi.org/10.5281/zenodo.19501604) (CC BY 4.0 compilation/documentation; [citation terms](https://hfdatalibrary.com/pages/cite)). Upstream market data: [IEX Historical Data Terms of Use](https://www.iex.io/legal/hist-data-terms). Edison filters approved dates, aggregates raw IEX bars and computes hypothetical research outputs with separately sourced dividends; it does not use HF's centered clean-data filter (its 50-bar centered window uses future observations). Token symbol metadata: Bitget public API. Model: Jev via [OpenCode Zen](https://opencode.ai/docs/zen/#jev). Full source list: [docs/RESEARCH.md](docs/RESEARCH.md).

## What's in the box

Landing page, comparison view, full decision audit, trade inspector with missed winners/avoided losses, method and limits page, accessible chart, permission-aware export, and a read-only Bitget venue-context panel with explicit failure states. Bounded routing and per-instance request limits throughout.

## Architecture at a glance

```text
 research question
        │
        ▼
 /api/route ──── explicit intent rules ──── (optional) Jev classification
        │              model output may select a view;
        ▼              it can never supply facts or numbers
 /research pages ◄── server-only evidence loader
        │             (hash-validated private bundle,
        ▼              fail-closed: no bundle → method only)
 /api/export ──── deterministic Markdown research note
 /api/context ─── Bitget public symbol metadata (read-only)
```

- **Server-rendered evidence boundary.** Next.js App Router: evidence is loaded and schema-validated server-side from a privately provisioned, digest-checked bundle; only derived display data reaches the client. Dynamic rendering keeps private evidence out of static build output, and committed defaults withhold evidence entirely.
- **Constrained AI surface.** Jev classifies intent and gate conditions only; every figure on screen comes from the validated evidence bundle, never from model output. A deterministic non-AI fallback serves every view when the model is disabled, unreachable or unconvincing — provider errors produce honest fallback states, not confabulated data.
- **Three bounded API routes.** `/api/route` (intent + optional Jev), `/api/context` (Bitget public metadata) and `/api/export` (deterministic Markdown note) — each with input bounds, timeouts and per-instance request limits — these are the only network egress points (public live routing additionally warrants host/edge limits); no other external calls exist.
- **Stack.** TypeScript end to end, Tailwind v4, shadcn/ui primitives on Base UI (keyboard, theme, reduced-motion and print support), Vitest suite, Zod-validated API boundaries. No accounts, no database, no orders — the state lives in the URL and the export file.

## The Bitget connection, precisely

Edison connects to Bitget in exactly one place: a read-only context panel that fetches **public spot symbol metadata** (such as the tokenized-stock symbols) from Bitget's public API, on demand, so the token-market venue's constraints can be inspected alongside the native-stock research. The request is schema-validated with a timeout and response cap, and failures produce an explicit error — never substitute data, cached guesses or a degraded backtest.

What this integration is not: no orders, no accounts, no private API, no live market feed, no token backtest and no token-market performance claims. Provider logos are not integration evidence, so we claim only what is exercised: a passing metadata check against the live public endpoint, wrapped in honest failure states.

## Run it locally

Requires Node.js 24 and npm. No API keys, accounts or downloads are needed.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:3000`. The dev server binds to loopback only.

**What to expect:** the repository ships no research data, by design. The app runs in **method-only mode** — every page, the full journey, the Bitget context panel and the permission-aware export work, but the derived results shown above appear only when a validated evidence bundle is privately provisioned to an approved runtime (see `.env.example`; committed defaults are fail-closed). Nothing fake is rendered in place of it. Optional: set `EDISON_JEV_ENABLED=true` in `.env.local` to route the research question through the free Jev endpoint; the deterministic non-AI fallback serves the same views when it is off, unreachable or unconvincing.

A production check on your machine: `npm run build`, then `EDISON_EVIDENCE_MODE=local npm run start -- --hostname 127.0.0.1` (loopback-only; still withholds the private bundle unless you provision one).

## Verification

```sh
npm run lint && npm run typecheck && npm test
npm run build && npm run scan && npm audit
```

97 local tests, including two against the ignored private bundle (skipped in public CI when absent) and four opt-in network tests (skipped by default). Publication scan and dependency audit report clean. See `.env.example` for the server-only evidence/publication flags.

## Documents

[Scope](docs/PROJECT.md) · [Research protocol](docs/RESEARCH.md) · [Architecture](docs/ARCHITECTURE.md) · [Design](docs/DESIGN.md) · [Judge story](docs/JUDGE_STORY.md) · [Judging gates](docs/JUDGING.md) · [Current state](docs/CURRENT_STATE.md) · [Publication record](docs/PUBLICATION.md) · [Implementation](docs/IMPLEMENTATION.md) · [Deployment](docs/DEPLOYMENT.md) · [Demo](docs/DEMO.md)

## Status

Edison is being prepared for submission to the **Bitget AI Base Camp Hackathon S2 — AI Trading Desk** track. Vercel Hobby is selected and preview preparation is approved; server-only evidence provisioning is implemented but no Vercel project or deployment has been created. Merge, production promotion, narration generation and final submission remain pending approval.

Never commit raw data, credentials or private evidence.
