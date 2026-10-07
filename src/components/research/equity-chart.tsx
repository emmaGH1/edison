"use client";
import { useId, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { policyIds, policyNames, type Evidence, type PolicyId } from "@/lib/evidence/schema";
import { dateLabel, money } from "@/lib/evidence/selectors";

const colors: Record<PolicyId, string> = {
  crossover: "var(--foreground)",
  rule_filter: "var(--green)",
  jev: "var(--violet)",
  buy_hold: "var(--subtle)",
};
const dashes: Record<PolicyId, string> = {
  crossover: "",
  rule_filter: "5 3",
  jev: "",
  buy_hold: "2 4",
};
export function EquityChart({ evidence }: { evidence: Evidence }) {
  const id = useId(),
    rows = evidence.equity;
  const [index, setIndex] = useState(rows.length - 1);
  const [visible, setVisible] = useState<PolicyId[]>([...policyIds]);
  const all = rows.flatMap((row) => visible.map((policy) => row[policy]));
  const max = Math.max(150000, Math.ceil(Math.max(...all, 100000) / 50000) * 50000);
  const width = 600,
    height = 235,
    left = 45,
    right = 15,
    top = 12,
    bottom = 25;
  const x = (i: number) => left + (i / (rows.length - 1)) * (width - left - right);
  const y = (value: number) => top + (1 - value / max) * (height - top - bottom);
  const row = rows[index];
  return (
    <section className="panel" aria-labelledby={id + "-heading"}>
      <div className="panel-head">
        <div>
          <h2 id={id + "-heading"}>Same capital. Different paths.</h2>
          <p>Portfolio value · $100,000 initial capital · 10 bps per side</p>
        </div>
      </div>
      <div className="legend" aria-label="Chart policies">
        {policyIds.map((policy) => (
          <button
            key={policy}
            className={"legend-button " + policy}
            aria-pressed={visible.includes(policy)}
            onClick={() =>
              setVisible((current) =>
                current.includes(policy)
                  ? current.filter((p) => p !== policy)
                  : [...current, policy],
              )
            }
          >
            <i
              style={{ background: colors[policy], opacity: visible.includes(policy) ? 1 : 0.3 }}
              aria-hidden="true"
            />
            {policyNames[policy]}
          </button>
        ))}
      </div>
      <div className="chart-wrap">
        <svg
          className="equity-chart"
          viewBox={"0 0 " + width + " " + height}
          role="img"
          aria-labelledby={id + "-title " + id + "-desc"}
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const position =
              (((event.clientX - rect.left) / rect.width) * width - left) / (width - left - right);
            setIndex(
              Math.max(0, Math.min(rows.length - 1, Math.round(position * (rows.length - 1)))),
            );
          }}
        >
          <title id={id + "-title"}>Captured native-stock portfolio values</title>
          <desc id={id + "-desc"}>
            First session and month-end observations, not a live feed. Drawdown metrics use separate
            daily marks. Use the date slider or table to inspect exact values.
          </desc>
          {Array.from({ length: 5 }, (_, i) => (max * i) / 4).map((value) => (
            <g key={value}>
              <line
                className="chart-grid"
                x1={left}
                x2={width - right}
                y1={y(value)}
                y2={y(value)}
              />
              <text className="chart-label" x={left - 7} y={y(value) + 4} textAnchor="end">
                ${Math.round(value / 1000)}k
              </text>
            </g>
          ))}
          {["2021", "2022", "2023", "2024"].map((year) => {
            const i = rows.findIndex((r) => r.date.startsWith(year));
            return (
              <text key={year} className="chart-label" x={x(i)} y={height - 5} textAnchor="middle">
                {year}
              </text>
            );
          })}
          {visible.map((policy) => (
            <path
              key={policy}
              d={rows
                .map(
                  (r, i) => (i === 0 ? "M" : "L") + x(i).toFixed(2) + "," + y(r[policy]).toFixed(2),
                )
                .join(" ")}
              fill="none"
              stroke={colors[policy]}
              strokeWidth={policy === "jev" ? 2.6 : 1.6}
              strokeDasharray={dashes[policy]}
            />
          ))}
          <line
            x1={x(index)}
            x2={x(index)}
            y1={top}
            y2={height - bottom}
            stroke="var(--line)"
            strokeDasharray="3 3"
          />
          {visible.map((policy) => (
            <circle
              key={policy}
              cx={x(index)}
              cy={y(row[policy])}
              r={policy === "jev" ? 4 : 3}
              fill={colors[policy]}
              stroke="var(--paper)"
              strokeWidth="1.5"
            />
          ))}
        </svg>
      </div>
      <div className="chart-readout" aria-live="off">
        <b>{dateLabel(row.date)}</b>
        {policyIds.map((policy) => (
          <span key={policy}>
            {policyNames[policy]} <b>{money(row[policy])}</b>
          </span>
        ))}
      </div>
      <div className="chart-control">
        <Button
          variant="outline"
          aria-label="Previous chart observation"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          <ChevronLeft size={15} />
        </Button>
        <label htmlFor={id + "-date"} className="sr-only">
          Chart observation date
        </label>
        <input
          id={id + "-date"}
          type="range"
          min={0}
          max={rows.length - 1}
          value={index}
          aria-valuetext={
            dateLabel(row.date) + ". Jev " + money(row.jev) + ". Unfiltered " + money(row.crossover)
          }
          onChange={(event) => setIndex(Number(event.target.value))}
        />
        <Button
          variant="outline"
          aria-label="Next chart observation"
          disabled={index === rows.length - 1}
          onClick={() => setIndex((i) => i + 1)}
        >
          <ChevronRight size={15} />
        </Button>
      </div>
      <p className="chart-help">
        Arrow keys move between observations. Home / End jump to first / last. Toggle a policy above
        to compare scales.
      </p>
      <details className="chart-table">
        <summary>Accessible data table · {rows.length} observations</summary>
        <div className="table-scroll">
          <table>
            <caption>Captured portfolio value, USD. First session plus month-end sampling.</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                {policyIds.map((policy) => (
                  <th key={policy} scope="col">
                    {policyNames[policy]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.date}>
                  <th scope="row">{dateLabel(r.date)}</th>
                  {policyIds.map((policy) => (
                    <td key={policy}>{money(r[policy], 2)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <p className="panel-note">
        Hypothetical native-stock equity, including dividends, open positions and receivables. Not
        token-market performance. Month-end lines do not show intramonth extremes.
      </p>
    </section>
  );
}
