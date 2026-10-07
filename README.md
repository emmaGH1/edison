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

## Evidence is private

Frozen research and raw captures are excluded while publication rights are unresolved. Missing evidence is explicit, not replaced by fake numbers. Public production withholds evidence by default. Access to Alpaca is not redistribution permission.

The permission-safe export contains selected view, protocol, assumptions, sources and limitations. Derived results remain excluded until documented rights and explicit publication approval.

## Stack

Next.js App Router, TypeScript, Tailwind and generated shadcn/ui components backed by Base UI. No accounts/database. Optional free Jev routing with non-AI fallback. Read-only Bitget venue metadata is separate from native-stock research.

## Documents

[Scope](docs/PROJECT.md) · [Architecture](docs/ARCHITECTURE.md) · [Design](docs/DESIGN.md) · [Judge story](docs/JUDGE_STORY.md) · [Current state](docs/CURRENT_STATE.md) · [Implementation](docs/IMPLEMENTATION.md) · [Demo](docs/DEMO.md)

No deployment, merge, narration generation or submission is approved yet. Never commit raw data, credentials or private evidence.
