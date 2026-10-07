"use client";
import { Button } from "@/components/ui/button";
import type { Evidence, ResearchEvent } from "@/lib/evidence/schema";
import {
  completedTrades,
  dateLabel,
  filterIds,
  matchesFilter,
  outcomeLabel,
  pct,
  type FilterId,
} from "@/lib/evidence/selectors";

const labels: Record<FilterId, string> = {
  all: "All completed",
  skipped: "Skipped",
  taken: "Taken",
  missed_winners: "Missed winners",
  avoided_losses: "Avoided losses",
};
export function Audit({
  evidence,
  filter,
  selectedId,
  onFilter,
  onSelect,
}: {
  evidence: Evidence;
  filter: FilterId;
  selectedId?: string;
  onFilter: (filter: FilterId) => void;
  onSelect: (event: ResearchEvent) => void;
}) {
  const completed = completedTrades(evidence),
    rows = completed.filter((e) => matchesFilter(e, filter));
  const groups = [
    { taken: false, winner: false, title: "Skipped losses" },
    { taken: false, winner: true, title: "Skipped winners" },
    { taken: true, winner: false, title: "Kept losses" },
    { taken: true, winner: true, title: "Kept winners" },
  ];
  return (
    <>
      <div className="audit-summary">
        {groups.map((group) => (
          <div key={group.title}>
            <strong>
              {
                completed.filter(
                  (e) =>
                    e.jev_accept === group.taken &&
                    e.baseline_net_trade_return! > 0 === group.winner,
                ).length
              }
            </strong>
            <span>{group.title}</span>
          </div>
        ))}
      </div>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Every completed baseline trade.</h2>
            <p>One square = one trade. A dark border marks a featured example.</p>
          </div>
        </div>
        <div className="filter-row" role="group" aria-label="Trade filters">
          {filterIds.map((id) => (
            <Button
              key={id}
              variant="outline"
              aria-pressed={filter === id}
              onClick={() => onFilter(id)}
            >
              {labels[id]}
            </Button>
          ))}
        </div>
        <p className="panel-note" role="status">
          Showing {rows.length} of {completed.length} completed trades.
        </p>
        <div className="trade-matrix">
          {groups.map((group) => {
            const events = rows.filter(
              (e) =>
                e.jev_accept === group.taken && e.baseline_net_trade_return! > 0 === group.winner,
            );
            return (
              <section className="matrix-group" key={group.title}>
                <h3>
                  {group.title} <span>· {events.length}</span>
                </h3>
                <p>
                  {group.taken ? "Jev admitted the entry" : "Jev rejected the entry"} · baseline{" "}
                  {group.winner ? "gained" : "lost"}
                </p>
                <div className="trade-dots">
                  {events.map((event) => (
                    <button
                      key={event.event_id}
                      className={
                        "trade-dot " +
                        (group.winner ? "" : "loss ") +
                        (selectedId === event.event_id ? "selected " : "") +
                        (evidence.featured_event_ids.includes(event.event_id) ? "featured" : "")
                      }
                      aria-label={
                        event.symbol +
                        ", signal " +
                        dateLabel(event.signal_date) +
                        ", " +
                        outcomeLabel(event) +
                        ", baseline net return " +
                        pct(event.baseline_net_trade_return!, true)
                      }
                      aria-pressed={event.event_id === selectedId}
                      title={
                        event.symbol +
                        " · " +
                        event.signal_date +
                        " · " +
                        pct(event.baseline_net_trade_return!, true)
                      }
                      onClick={() => onSelect(event)}
                    >
                      {event.symbol.slice(0, 2)}
                    </button>
                  ))}
                </div>
                {events.length === 0 && <p>No trades in this group for the selected filter.</p>}
              </section>
            );
          })}
        </div>
        <p className="panel-note">
          {evidence.results.crossover.open_trades} baseline positions remained open at the November
          2024 cutoff and are excluded here. The entry-opportunity count includes those unfinished
          episodes. Winners/losers are known only after the recorded decision.
        </p>
      </section>
      <section className="panel trade-list">
        <div className="panel-head">
          <div>
            <h2>Dates, outcomes and stable event IDs.</h2>
            <p>Select a row’s event ID to inspect its captured labels.</p>
          </div>
        </div>
        <div className="table-scroll" role="region" aria-label="Scrollable completed trade table">
          <table>
            <caption>{labels[filter]} · hypothetical unfiltered outcomes</caption>
            <thead>
              <tr>
                <th scope="col">Event</th>
                <th scope="col">Stock</th>
                <th scope="col">Signal</th>
                <th scope="col">Entry</th>
                <th scope="col">Exit</th>
                <th scope="col">Jev</th>
                <th scope="col">Net return</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((event) => (
                <tr key={event.event_id} aria-selected={selectedId === event.event_id}>
                  <th scope="row">
                    <button
                      className="table-event-button"
                      aria-label={"Inspect event " + event.event_id}
                      onClick={() => onSelect(event)}
                    >
                      {event.event_id}
                    </button>
                  </th>
                  <td>{event.symbol}</td>
                  <td>{event.signal_date}</td>
                  <td>{event.entry_date}</td>
                  <td>{event.baseline_exit_date}</td>
                  <td>{event.jev_accept ? "Taken" : "Skipped"}</td>
                  <td className={event.baseline_net_trade_return! > 0 ? "positive" : "negative"}>
                    {pct(event.baseline_net_trade_return!, true)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
