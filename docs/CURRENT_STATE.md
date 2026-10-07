# Current state

Scope, architecture and design probe approved. The production app implements the landing page, comparison, full decision audit, inspector, method/limits, permission-aware export, read-only Bitget context and bounded routing. Evidence and credentials remain private. The minimal GitHub base is initialized with approval; the implementation is delivered through a separate feature PR.

## Validation

The HF/IEX v2 replacement passes local formatting, lint, typecheck, private evidence validation, production build, publication scan, dependency audit and production HTTP checks. The suite has 74 passing local tests including two against the ignored private bundle; public CI skips those two when absent. Four opt-in network tests are skipped by default. Dependency audit reports zero vulnerabilities. HTTP checks cover local/withheld rendering, attribution, security headers, method-only export even in private local mode, bounded routing, 2021 refusal and cross-origin refusal. Build artifacts contain neither private featured-event identifier.

Earlier approved browser testing passed desktop/mobile flows and the navigation fix at 320/390/760/761px against the previous evidence contract. Those recordings are historical coverage, not proof of the HF/IEX migration. The new approved retest is outstanding: two testing-agent handoffs returned a subscription usage-limit error before testing. A setup-only recording was stopped and is not validation evidence. Physical devices and live provider-failure/confident-Jev routing remain untested.

## Evidence replacement

The approved $0 HF Data Library/IEX-only case uses June 2022–November 2024 with March warm-up and raw minute bars. The old Alpaca evidence remains private and is not relabeled. Frozen inputs/questions preceded the new Jev calls and performance run; the negative advancement result is preserved, including the completed-position minimum. The v2 importer checks fixed comparison/audit/validation digests and validated daily-run receipts; schema validation reconciles admission counts and equity endpoints. HF author citation, CC BY 4.0 compilation/documentation license, IEX terms/attribution, venue coverage and transformed-data disclosure are in the UI/export.

Full-history files were acquired only under Emma's blind-extraction approval, and only allowed dates reach research. No 2025 price/fill/outcome was read or used. Post-cutoff Microsoft/Apple dividend rows surfaced in source checks and are quarantined unused; corporate-action reserves were not completely unopened. Token reserves remain untouched.

## Release gates

- The HF/IEX licensing/attribution route is documented; Emma's explicit approval to publish derived evidence is still outstanding. Production approval remains false, exports remain method-only, and raw/derived bundles stay outside Git. Old Alpaca permission is unresolved but no longer the proposed demo-data route.
- The updated desktop/mobile browser retest must finish when the testing agent is available; do not claim it passed from shell tests.
- The public Bitget metadata check passes. Free-Jev availability varies: initial live checks returned HTTP 403; later browser testing received a low-confidence structured result. Deterministic routing/fallback remains available and no paid fallback is used.
- Hosting/deployment, public demo content and final submission approval outstanding.
- ElevenLabs key secured separately; no audio generated, script/licensed voice/credit limit unapproved.

Sources checked October 7, 2026: https://hfdatalibrary.com/pages/license · https://hfdatalibrary.com/pages/cite · https://www.iex.io/legal/hist-data-terms.
