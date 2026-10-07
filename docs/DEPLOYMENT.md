# Vercel handoff — review before launch

Edison is the real Next.js app on `devin/1791370120-edison-research-workbench`, delivered through [PR #1](https://github.com/emmaGH1/edison/pull/1). Do not merge just to deploy it. `main` contains only the approved bootstrap, not the working app.

## Readiness

- Local automated validation passes: 97 tests, formatting, lint, types, build, publication scan, private evidence validation/import, twelve production HTTP configurations and a zero-vulnerability dependency audit.
- **The current HF/IEX-v2 desktop/mobile browser retest has not run.** Four approved testing-agent attempts failed at a subscription usage limit before browser interaction. Older recordings do not validate this version. A deployment is a review build, not a verified judge release.
- No Vercel project/deployment has been created by Devin. Emma selected Vercel and offered to deploy herself; no Vercel credential is required here for a user-led deployment. No paid plan, merge, production promotion, narration or submission is approved.

## Important first-import distinction

[Vercel makes a new project's first deployment Production](https://vercel.com/docs/deployments/environments), even when importing a feature branch or using the CLI without `--prod`. This is not a Preview deployment. Decide whether to create that first method-only deployment before clicking **Deploy**. Do not enable the derived evidence in Production at this stage.

After bootstrapping, non-production branch deployments are Preview. Keep the production branch separate from the feature branch. Do not enable automatic production promotion as a shortcut. Vercel Hobby's default authentication protects preview/deployment URLs, but the production domain is public; [review the protection settings](https://vercel.com/docs/security/deployment-protection). No paid protection add-on is needed.

## If Emma chooses to create the project

1. Sign in at [Vercel](https://vercel.com/dashboard), using a **Hobby** personal account. No card, Pro trial, paid storage, custom domain or upgrade is necessary. The app is personal/non-commercial research, subject to [Hobby limits](https://vercel.com/docs/plans/hobby).
2. Give the GitHub integration access to **Edison only**. Ensure the source revision is the working feature branch above, not bootstrap `main`. If the dashboard cannot select that branch at import, stop rather than merging: use a clean local checkout/CLI workflow or ask for help. Never deploy from the directory holding raw research captures.
3. Use the Next.js framework preset, repository root, Node.js **24.x**, install `npm ci`, build `npm run build`, default Next.js output. No keys for HF, Alpaca, ElevenLabs, Bitget or Jev belong in this project.
4. Keep these **Production** settings for the initial method-only deployment:

   ```dotenv
   EDISON_EVIDENCE_MODE=withheld
   EDISON_PUBLIC_EVIDENCE_APPROVED=false
   EDISON_JEV_ENABLED=false
   ```

   Leave `EDISON_EVIDENCE_PERMISSION_REF`, `EDISON_EVIDENCE_FILE`, `EDISON_EVIDENCE_GZIP_BASE64` and `EDISON_EVIDENCE_SHA256` absent in Production. Confirm the resulting UI says evidence is unavailable and export is method-only. That public method page is not the final judge site.

5. For a **subsequent feature-branch Preview**, add the following project variables, selecting Preview only and the exact feature branch. Never select Production or Development for the derived payload during this step:

   | Name                              | Value/source                                                              |
   | --------------------------------- | ------------------------------------------------------------------------- |
   | `EDISON_EVIDENCE_MODE`            | `withheld`                                                                |
   | `EDISON_PUBLIC_EVIDENCE_APPROVED` | `true`                                                                    |
   | `EDISON_EVIDENCE_PERMISSION_REF`  | `docs/PUBLICATION.md#hfiex-derived-evidence-approval`                     |
   | `EDISON_JEV_ENABLED`              | `false`                                                                   |
   | `EDISON_EVIDENCE_GZIP_BASE64`     | Privately supplied compressed validated **derived** JSON; store as Secret |
   | `EDISON_EVIDENCE_SHA256`          | Privately supplied SHA-256 of the original JSON; store as Secret          |

   Do not commit/publish the private environment values or use `NEXT_PUBLIC_`. [The loader](PUBLICATION.md#vercel-preview-provisioning) validates both transport integrity and the v2 schema; a missing/invalid configuration never fabricates results. No new storage service or data/model request is needed. The compressed payload is approximately 9.6 KB, within Vercel's 64 KB total Node.js environment limit; check the total with provider-managed variables.

6. Create a new deployment of the feature branch **after** saving Preview variables. Verify its environment is Preview. Variable edits do not alter old deployments. Keep preview authentication on; use your own logged-in browser for review. If inviting a reviewer, Hobby permits one shareable link per account; use it deliberately and never publish a protection bypass token to GitHub.
7. Send the deployment URL/build status back here. Do not promote it to the public judge URL until the actual rendered app has been reviewed and the remaining release decisions are approved.

## Review checklist — not a completed test report

On desktop and mobile, inspect the landing → question → comparison → audit → decision inspector → export path. Check all three workspace tabs, themes, keyboard controls and absence of horizontal overflow at 320/390px. Confirm HF/IEX-only attribution and limitations remain visible.

With approved evidence, expect 37 signals, 34 completed baseline positions, 10 Jev admissions and **AI improvement not proven / advancement gate failed**. At 10 bps, CAGR is 21.17% crossover, 5.42% rule filter, 1.93% Jev and 49.13% buy-and-hold. Exposure reduction is not AI alpha. Check an actual missed winner and avoided loss; export should include only the selected completed event, not the full audit/equity archive.

Without approval/reference, or with missing/invalid evidence, expect an unavailable results state and a method-only note. Confirm no private bundle URL exists and app security headers are retained. Live Jev, confident/provider-failure paths and physical devices are not validated by the shell checks. Do not describe any of these checklist items as passed until observed.

## Separate release decisions

The preview needs human inspection, the current browser-testing gap needs resolution or an explicit release decision, and PR merge remains Emma's choice. A public judge deployment, demo script/voice/credit cap, narration and final submission are separate approvals. No orders, trading account connection, paid fallback or reserved-data tuning is part of this handoff.
