"use client";
import { ArrowUpRight, CircleSlash } from "lucide-react";
import { EquityChart } from "./equity-chart";
import { policyIds, policyNames, type Evidence, type ResearchEvent } from "@/lib/evidence/schema";
import { dateLabel, money, outcomeLabel, pct } from "@/lib/evidence/selectors";

export function Comparison({
  evidence,
  selectedId,
  onSelect,
}: {
  evidence: Evidence;
  selectedId?: string;
  onSelect: (event: ResearchEvent) => void;
}) {
  const jev = evidence.results.jev,
    baseline = evidence.results.crossover;
  const episodes = evidence.featured_event_ids.map(
    (id) => evidence.audit.find((event) => event.event_id === id)!,
  );
  return (
    <>
      <section className="finding">
        <CircleSlash size={21} aria-hidden="true" />
        <div>
          <h2>The AI improvement gate did not pass.</h2>
          <p>
            Jev reduced drawdown, but underperformed unfiltered on annualized return and Sharpe.
            Lower exposure is part of the story—not proof of better decisions.
          </p>
        </div>
      </section>
      <dl className="metric-grid">
        <div className="metric">
          <dt>Annualized return · Jev</dt>
          <dd>{pct(jev.cagr, true)}</dd>
          <small>vs {pct(baseline.cagr, true)} unfiltered</small>
        </div>
        <div className="metric">
          <dt>Maximum drawdown · Jev</dt>
          <dd>{pct(jev.max_drawdown_daily_close)}</dd>
          <small>vs {pct(baseline.max_drawdown_daily_close)} unfiltered</small>
        </div>
        <div className="metric">
          <dt>Invested fraction · Jev</dt>
          <dd>{pct(jev.mean_close_invested_fraction)}</dd>
          <small>vs {pct(baseline.mean_close_invested_fraction)} unfiltered</small>
        </div>
      </dl>
      <EquityChart evidence={evidence} />
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Keep the alternatives in view.</h2>
            <p>Same basket, period and primary cost scenario</p>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <caption className="sr-only">Policy comparison at 10 basis points per side</caption>
            <thead>
              <tr>
                <th scope="col">Policy</th>
                <th scope="col">CAGR</th>
                <th scope="col">Drawdown</th>
                <th scope="col">Sharpe</th>
                <th scope="col">Exposure</th>
                <th scope="col">Entries</th>
              </tr>
            </thead>
            <tbody>
              {policyIds.map((policy) => {
                const m = evidence.results[policy];
                return (
                  <tr key={policy} className={policy === "jev" ? "jev-row" : undefined}>
                    <th scope="row">
                      <span className="policy-label">
                        <i aria-hidden="true" />
                        {policyNames[policy]}
                      </span>
                    </th>
                    <td>{pct(m.cagr, true)}</td>
                    <td>{pct(m.max_drawdown_daily_close)}</td>
                    <td>{m.sharpe_252_zero_rf.toFixed(3)}</td>
                    <td>{pct(m.mean_close_invested_fraction)}</td>
                    <td>
                      {m.entries}
                      {policy === "buy_hold" ? " initial" : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <details>
          <summary>Costs, turnover, Sortino and full-period return</summary>
          <div className="table-scroll">
            <table>
              <caption>
                Net metrics. Turnover = annualized traded notional / mean portfolio equity.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Policy</th>
                  <th scope="col">Total return</th>
                  <th scope="col">Sortino</th>
                  <th scope="col">Turnover</th>
                  <th scope="col">Cost</th>
                  <th scope="col">Completed / open</th>
                </tr>
              </thead>
              <tbody>
                {policyIds.map((policy) => {
                  const m = evidence.results[policy];
                  return (
                    <tr key={policy}>
                      <th scope="row">{policyNames[policy]}</th>
                      <td>{pct(m.total_return, true)}</td>
                      <td>{m.sortino_252_zero_mar.toFixed(3)}</td>
                      <td>{m.annualized_one_way_turnover.toFixed(2)}×</td>
                      <td>{money(m.modeled_cost_usd, 2)}</td>
                      <td>
                        {m.completed_trades} / {m.open_trades}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>
        <p className="panel-note">
          Buy-and-hold is a reference, not exposure-matched. Sharpe uses 252 daily sessions and zero
          risk-free rate; drawdown uses daily closes.
        </p>
      </section>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Was it judgment—or more time in cash?</h2>
            <p>Mean daily-close invested fraction</p>
          </div>
        </div>
        <div className="exposure-grid">
          <div>
            {(["crossover", "jev"] as const).map((key) => (
              <div className="exposure-row" key={key}>
                <div>
                  <span>{policyNames[key]}</span>
                  <b>{pct(evidence.results[key].mean_close_invested_fraction)}</b>
                </div>
                <div className="exposure-track" aria-hidden="true">
                  <span
                    className={key}
                    style={{
                      width: String(evidence.results[key].mean_close_invested_fraction * 100) + "%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="exposure-copy">
            <strong>Less exposure is not a matched experiment.</strong>
            <p>
              The rule filter’s {pct(evidence.results.rule_filter.mean_close_invested_fraction)}{" "}
              exposure differs from Jev’s {pct(jev.mean_close_invested_fraction)}. Compare both
              before attributing the safer chart to AI.
            </p>
          </div>
        </div>
        <details>
          <summary>Ex-post exposure diagnostic · not investable</summary>
          <p className="panel-note">
            Scaling all unfiltered daily returns by{" "}
            {evidence.ex_post_exposure_diagnostics.jev.constant_daily_return_scale.toFixed(4)} gives{" "}
            {pct(evidence.ex_post_exposure_diagnostics.jev.total_return, true)} total return and{" "}
            {pct(evidence.ex_post_exposure_diagnostics.jev.max_drawdown)} drawdown. Selected from
            full-period exposure, this is not a daily exposure match, tradable strategy or causal
            proof.
          </p>
        </details>
      </section>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Inspect both sides of saying no.</h2>
            <p>Hindsight-selected examples · not typical performance</p>
          </div>
        </div>
        <div className="episodes">
          {episodes.map((event) => (
            <button
              key={event.event_id}
              className={"episode " + (selectedId === event.event_id ? "selected" : "")}
              aria-pressed={selectedId === event.event_id}
              onClick={() => onSelect(event)}
            >
              <span className="episode-label">{outcomeLabel(event)}</span>
              <span className="episode-title">
                <b>{event.symbol}</b>
                <span className={event.baseline_net_trade_return! > 0 ? "positive" : "negative"}>
                  {pct(event.baseline_net_trade_return!, true)}
                </span>
              </span>
              <p>
                {dateLabel(event.entry_date)} → {dateLabel(event.baseline_exit_date!)}
              </p>
              <span className="inspect-link">
                Inspect the decision <ArrowUpRight size={13} aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>
        <p className="panel-note">
          Returns are net hypothetical baseline-trade outcomes. Jev skipped these entries; they are
          not Jev trade returns.
        </p>
      </section>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Year by year, not one headline.</h2>
            <p>Net portfolio calendar-year returns · 2022 and 2024 are partial years</p>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Year</th>
                {policyIds.map((p) => (
                  <th key={p} scope="col">
                    {policyNames[p]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(["2022", "2023", "2024"] as const).map((year) => (
                <tr key={year}>
                  <th scope="row">{year}</th>
                  {policyIds.map((p) => (
                    <td key={p}>{pct(evidence.results[p].annual_returns[year], true)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="panel-note">
          June–December 2022 and January–November 2024 are partial periods. These are not
          independent tests.
        </p>
      </section>
    </>
  );
}
