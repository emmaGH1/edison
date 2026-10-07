"use client";
import { useState } from "react";
import { ScanSearch } from "lucide-react";
import type { Evidence, ResearchEvent } from "@/lib/evidence/schema";
import { dateLabel, outcomeLabel, pct } from "@/lib/evidence/selectors";

export function Inspector({
  event,
  evidence,
}: {
  event?: ResearchEvent;
  evidence: Evidence | null;
}) {
  const [copyState, setCopyState] = useState("");
  return (
    <aside className="lab-inspector" aria-label="Selected decision evidence">
      <div className="inspector-header">
        <span>Decision inspector</span>
        <ScanSearch size={16} aria-hidden="true" />
      </div>
      {event && evidence ? (
        <>
          <div className="inspector-head">
            <p className="eyebrow">{outcomeLabel(event)}</p>
            <h2 id="inspector-title" tabIndex={-1}>
              {event.symbol}
            </h2>
            <p>Signal recorded {dateLabel(event.signal_date)}</p>
          </div>
          <section className="inspector-outcome">
            <span className="eyebrow">Unfiltered trade outcome</span>
            <strong className={event.baseline_net_trade_return! > 0 ? "positive" : "negative"}>
              {pct(event.baseline_net_trade_return!, true)}
            </strong>
            <p>
              Net hypothetical baseline return at 10 bps per side.{" "}
              {event.jev_accept
                ? "Jev also admitted this entry."
                : "Jev skipped this entry; it did not earn this return."}
            </p>
          </section>
          <section className="inspector-section">
            <h3>Same signal, different entry gate</h3>
            <dl>
              <div>
                <dt>Unfiltered</dt>
                <dd>Entered</dd>
              </div>
              <div>
                <dt>Simple rule</dt>
                <dd>{event.rule_accept ? "Entered" : "Skipped"}</dd>
              </div>
              <div>
                <dt>Jev gate</dt>
                <dd>
                  <span className="decision-state">
                    {event.jev_accept ? "Admitted" : "Skipped"}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Trend label</dt>
                <dd>{event.trend_choice}</dd>
              </div>
              <div>
                <dt>Volatility label</dt>
                <dd>{event.risk_choice}</dd>
              </div>
              <div>
                <dt>Reversed options</dt>
                <dd>{event.reversed_order_accept ? "Admitted" : "Skipped"} · same</dd>
              </div>
            </dl>
          </section>
          <section className="inspector-section">
            <h3>Hypothetical fill trace</h3>
            <dl>
              <div>
                <dt>Signal close</dt>
                <dd>{dateLabel(event.signal_date)}</dd>
              </div>
              <div>
                <dt>Baseline entry</dt>
                <dd>{dateLabel(event.entry_date)}</dd>
              </div>
              <div>
                <dt>Baseline exit</dt>
                <dd>{dateLabel(event.baseline_exit_date!)}</dd>
              </div>
            </dl>
            <p style={{ marginTop: 12 }}>
              Entry/exit use the next-session 10:05 New York five-minute bar open. Simulated fills,
              not quotes or executed orders.
            </p>
          </section>
          <section className="inspector-section">
            <h3>Recorded Jev decision</h3>
            <p>
              Admit only when trend is supported, risk manageable and both classification
              confidences ≥0.70. Otherwise skip. These are captured labels, not a new model
              recommendation.
            </p>
          </section>
          <section className="inspector-section">
            <h3>Source reference</h3>
            <p>Frozen development decision audit</p>
            <code className="event-id">{event.event_id}</code>
            <button
              className="copy-event"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(event.event_id);
                  setCopyState("Event ID copied.");
                } catch {
                  setCopyState("Copy unavailable. Select the event ID above.");
                }
              }}
            >
              Copy event ID
            </button>
            <p role="status">{copyState}</p>
          </section>
          <p className="inspector-disclaimer">
            {evidence.featured_event_ids.includes(event.event_id)
              ? "This example was selected in hindsight. "
              : ""}
            Historical confidence is not probability of profit. Native stocks, development only. No
            causal conclusion or token validation.
          </p>
        </>
      ) : (
        <div className="inspector-empty">
          <h2>No substitute evidence.</h2>
          <p>
            {evidence
              ? "Select a completed trade to inspect its recorded decision."
              : "The private research bundle is not available here. Publication permission is unresolved; no results or historical AI labels have been invented."}
          </p>
        </div>
      )}
    </aside>
  );
}
