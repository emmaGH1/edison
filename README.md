# Edison

**See whether AI actually helped.** Compare a strategy with and without a Jev entry gate, inspect missed winners and avoided losses, and check costs and evidence limits.

Not a predictor, investment recommendation or live trading app. Native-stock research is not token-market performance.

## Development

Node.js 24, npm.

```sh
npm ci
npm run dev
```

No key is required to run the interface. Market-data and ElevenLabs credentials do not belong in this app. See `.env.example` for server-only feature/publication flags.

## Evidence and publication

The replacement research uses free HF Data Library raw IEX-only bars for June 2022–November 2024, not the old Alpaca results. HF licenses its compilation/documentation under CC BY 4.0; upstream IEX attribution and terms also apply. Source attribution, changes and venue limitations are included in the interface and notes.

Emma approved public use of the validated HF/IEX-derived results with attribution and limitations; see the scoped [publication record](docs/PUBLICATION.md). Raw captures and derived runtime bundles remain outside Git. Missing evidence is explicit, not replaced by fake numbers. Committed production defaults still withhold evidence; an approved runtime must configure both server-only publication values and privately provision the validated bundle. No paid data or model fallback.

The permission-safe export contains selected view, protocol, assumptions, sources and limitations. Approved runtimes also include derived comparisons and an optional selected completed event; unapproved or missing/invalid-evidence runtimes remain method-only. No raw archive is exported.

## Stack

Next.js App Router, TypeScript, Tailwind and generated shadcn/ui components backed by Base UI. No accounts/database. Optional free Jev routing with non-AI fallback. Read-only Bitget venue metadata is separate from native-stock research.

## Documents

[Scope](docs/PROJECT.md) · [Architecture](docs/ARCHITECTURE.md) · [Design](docs/DESIGN.md) · [Judge story](docs/JUDGE_STORY.md) · [Current state](docs/CURRENT_STATE.md) · [Implementation](docs/IMPLEMENTATION.md) · [Demo](docs/DEMO.md)

No deployment, merge, narration generation or submission is approved yet. Never commit raw data, credentials or private evidence.
