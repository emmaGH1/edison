# Derived-evidence publication record

## HF/IEX derived-evidence approval

On October 7, 2026, Emma approved **"Approve derived results only"** in response to:

> Approve public use of the HF/IEX-derived results, with required attribution and IEX-only limitations? This does not authorize merging or deployment.

[Approval conversation](https://app.devin.ai/sessions/c0225e3bedb74e08bbffc30b50ea9f11).

This approval applies only to Edison's validated `edison-evidence-v2` HF Data Library/IEX-only June 1, 2022–November 29, 2024 development case. It permits derived policy comparisons, equity visualizations, decision/outcome audits, illustrative hypothetical trade outcomes and selected-event research notes with the sources and limitations below. Preserve the negative advancement-gate result and distinguish historical recorded decisions from new navigation requests.

It does **not** authorize publishing raw bars/quotes, full data or capture archives, provider response bodies, credentials or the old Alpaca evidence. Derived runtime bundles remain outside Git. No merge, hosting/deployment, narrated media generation, trading or submission is authorized by this approval.

### Source and attribution route

- [HF Data Library license](https://hfdatalibrary.com/pages/license): CC BY 4.0 for its compilation/documentation; upstream IEX rights and terms also apply.
- [HF citation](https://hfdatalibrary.com/pages/cite): Elkassabgi, Ahmed. 2026. _HF Data Library: High-Frequency U.S. Equity Data (1-Minute OHLCV)_. [DOI: 10.5281/zenodo.19501604](https://doi.org/10.5281/zenodo.19501604). Accessed October 7, 2026.
- [IEX Historical Data Terms of Use](https://www.iex.io/legal/hist-data-terms).

Keep the following exact IEX attribution with published displays and exports:

> Data provided for free by IEX. By accessing or using IEX Historical Data, you agree to the IEX Historical Data Terms of Use.

Edison filters approved dates from raw minute bars, aggregates venue-specific observations and computes hypothetical research outputs. It does not use HF's centered clean-data filter. HF prices are split-adjusted only; issuer-sourced dividends are accounted for separately. Source license terms are not a guarantee of data accuracy or an endorsement of Edison.

### Required limitations

- IEX-only coverage, approximately 2–3% of consolidated volume; gaps can represent missing IEX trades. Fill references and daily close proxies are not consolidated quotes, official auction closes or observed orders.
- Development-only, survivor-selected five-stock case; prior pilots and possible model training contamination limit independence. Small dependent samples, different gate features and lower exposure do not establish AI alpha.
- Hypothetical accounting and modeled costs; no investment recommendation, independently reproducible full backtest or established token-market performance.
- Blind extraction keeps reserved 2025 market prices/fills/outcomes out of research. Unused post-cutoff Microsoft/Apple dividend rows surfaced during source checks; do not claim corporate-action reserves were completely unopened. The separate token reserve remains untouched.

See [research protocol](RESEARCH.md) for the complete accounting and evidence boundaries.

### Runtime configuration

Committed defaults remain fail-closed. For an approved runtime that privately provisions the validated bundle, configure the two server-only values together:

```dotenv
EDISON_PUBLIC_EVIDENCE_APPROVED=true
EDISON_EVIDENCE_PERMISSION_REF="docs/PUBLICATION.md#hfiex-derived-evidence-approval"
```

Never prefix them with `NEXT_PUBLIC_`. Keep `EDISON_JEV_ENABLED=false` unless live navigation has separately been enabled. Changing these values requires restarting the runtime. Missing/invalid bundles remain unavailable; approval never substitutes synthetic evidence. Without both values, public production withholds evidence and exports method-only. Local evidence mode alone does not authorize derived exports.

Enabling this configuration on the private VM is not a public deployment. Choose and approve hosting separately; provision only the validated derived bundle server-side, not raw HF files or research captures.
