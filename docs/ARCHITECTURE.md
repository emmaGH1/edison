# Architecture

Next.js App Router, TypeScript, Tailwind v4, generated shadcn/ui primitives backed by Base UI. No accounts or database.

- `/`: entry experience. `/research`: comparison, audit, method, selected event; allowlisted query parameters preserve state.
- Server-only loader runtime-validates an ignored local bundle. Client components handle chart, filters and inspector. Dynamic pages must not prerender private evidence into static output.
- `/api/route`: bounded questions → explicit intent rules and optional free Jev structured choice. Model output cannot supply metrics, code, URLs, orders or strategy instructions. Non-AI fallback remains available.
- `/api/context`: Bitget public symbol metadata for venue constraints, separate from native-stock research. No market-performance claims.
- `/api/export`: deterministic Markdown. Without rights, protocol/selected-view/sources only; no derived numbers, events or equity observations.

## Publication boundary

`.edison-private/evidence.json` is ignored, outside `public/`, validated server-side. Production withholds it by default. Local production requires explicit local mode and loopback binding. Public evidence requires documented permission and an explicit publication flag.

## Failures

Absent/invalid evidence is unavailable, never replaced by fake samples. Provider errors/timeouts/invalid output produce honest fallback states. Per-instance request limits are bounded, not distributed; public live routing additionally needs host/edge limits.
