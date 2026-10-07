"use client";
import { CircleSlash } from "lucide-react";
import { policyIds, policyNames, type Evidence } from "@/lib/evidence/schema";
import { pct, money } from "@/lib/evidence/selectors";
import { assumptions, evidenceLimits, researchSources } from "@/lib/protocol";
import { VenueContext } from "./venue-context";

const gateLabels: Record<string, string> = {
  healthy_complete_run: "Complete valid run",
  option_order_stable: "Option order stable",
  at_least_20_completed: "At least 20 completed Jev positions",
  sharpe_beats_both: "Sharpe beats unfiltered and rule filter",
  cagr_at_least_crossover: "CAGR at least unfiltered",
  drawdown_no_worse_than_both: "Drawdown no worse than both",
};
export function Method({ evidence, approved }: { evidence: Evidence | null; approved: boolean }) {
  return (
    <>
      <section className="panel method-section">
        <div className="panel-head">
          <div>
            <h2>The experiment, frozen before evaluation.</h2>
            <p>Development research · no strategy uploads or live trading</p>
          </div>
        </div>
        <h3>One strategy. Four policies.</h3>
        <p>
          The 20-session simple moving average crosses above the 50-session average: next-session
          entry. It crosses below: next-session exit. Initially flat. No parameter search, ticker
          replacement or outcome-driven date extension.
        </p>
        <p>
          <b>Unfiltered:</b> every upward cross. <b>Rule filter:</b> positive five-session slope of
          the 50-session mean and 20-session volatility ≤60-session volatility. <b>Jev:</b>{" "}
          supported trend, manageable volatility risk, both classification confidences ≥0.70.{" "}
          <b>Buy-and-hold:</b> same basket, initial purchases only.
        </p>
        <p>
          Jev saw anonymous point-in-time features, not ticker, date, absolute price or future
          outcomes. It admitted or skipped entries—not exits, sizing or predicted prices. Rejected
          entries remain cash until a fresh cross.
        </p>
        <h3>Accounting and assumptions</h3>
        <ul>
          {assumptions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          Inspect captured outputs here. This app does not rerun the backtest; a note alone cannot
          reproduce it without licensed source data and the separate research implementation.
        </p>
      </section>
      {evidence && (
        <section className="panel method-section">
          <div className="finding">
            <CircleSlash size={19} aria-hidden="true" />
            <div>
              <h2>Advancement gate: failed.</h2>
              <p>
                Reduced drawdown did not offset failure on CAGR, Sharpe and the
                20-completed-position minimum. The product preserves that conclusion.
              </p>
            </div>
          </div>
          <ul className="gate-list">
            {Object.entries(evidence.gate_checks).map(([key, passed]) => (
              <li key={key}>
                <span>{gateLabels[key]}</span>
                <span className={passed ? "positive" : "negative"}>
                  {passed ? "Passed" : "Failed"}
                </span>
              </li>
            ))}
          </ul>
          <p>
            Engineering thresholds, not statistical significance tests.{" "}
            {evidence.api.valid_responses} valid free responses: primary decisions plus
            reversed-option robustness calls. No admission disagreements. Median captured latency{" "}
            {evidence.api.median_latency_seconds.toFixed(3)}s. These are historical calls, not
            today’s routing status.
          </p>
        </section>
      )}
      <section className="panel method-section">
        <h2 id="costs" tabIndex={-1}>
          Costs are assumptions—not account entitlements.
        </h2>
        <p>
          0, 5, 10 and 20 basis points per side were captured; 10 is primary. Includes hypothetical
          adverse fees, spread and slippage. No interpolation, rerun or actual liquidity-capacity
          claim.
        </p>
        {evidence ? (
          <>
            <div className="table-scroll">
              <table>
                <caption>Captured cost scenarios · annualized return (CAGR)</caption>
                <thead>
                  <tr>
                    <th scope="col">Cost / side</th>
                    {policyIds.map((policy) => (
                      <th key={policy} scope="col">
                        {policyNames[policy]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(["0", "5", "10", "20"] as const).map((cost) => (
                    <tr key={cost}>
                      <th scope="row">
                        {cost} bps{cost === "10" ? " · primary" : ""}
                      </th>
                      {policyIds.map((policy) => (
                        <td key={policy}>
                          {pct(evidence.cost_scenarios[cost][policy].cagr, true)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-scroll">
              <table>
                <caption>Jev cost sensitivity · hypothetical portfolio</caption>
                <thead>
                  <tr>
                    <th scope="col">Cost / side</th>
                    <th scope="col">Drawdown</th>
                    <th scope="col">Sharpe</th>
                    <th scope="col">Modeled total cost</th>
                  </tr>
                </thead>
                <tbody>
                  {(["0", "5", "10", "20"] as const).map((cost) => {
                    const m = evidence.cost_scenarios[cost].jev;
                    return (
                      <tr key={cost}>
                        <th scope="row">{cost} bps</th>
                        <td>{pct(m.max_drawdown_daily_close)}</td>
                        <td>{m.sharpe_252_zero_rf.toFixed(3)}</td>
                        <td>{money(m.modeled_cost_usd, 2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p>
            Scenario results are withheld. This is the frozen protocol, not simulated substitute
            output.
          </p>
        )}
      </section>
      <section className="panel method-section">
        <h2 id="limits" tabIndex={-1}>
          What this does not establish.
        </h2>
        <ul>
          {evidenceLimits.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <VenueContext />
      <section className="panel method-section">
        <h2>Sources and publication boundary.</h2>
        <p>
          {approved
            ? "Publication is explicitly enabled by the operator. Only permitted derived notes—not raw archives—can be exported."
            : "Derived research publication is not approved. Export contains view, protocol, assumptions, sources and limitations only; no metrics, events or equity values."}
        </p>
        <div className="source-list">
          {researchSources.map((source) => (
            <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
              {source.label} ↗
            </a>
          ))}
        </div>
        {evidence && (
          <details>
            <summary>Frozen source SHA-256 receipts</summary>
            <dl className="hash-list">
              {Object.entries(evidence.source_hashes).map(([name, digest]) => (
                <div key={name}>
                  <dt>{name}</dt>
                  <dd>{digest}</dd>
                </div>
              ))}
            </dl>
            <p>
              Integrity receipts, not redistribution rights or a cryptographic proof of model
              correctness.
            </p>
          </details>
        )}
      </section>
    </>
  );
}
