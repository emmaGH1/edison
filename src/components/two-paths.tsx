import type { ResearchEvent } from "@/lib/evidence/schema";

type Point = [number, number];
const planes: Record<string, Point[]> = {
  source: [
    [15, 299],
    [184, 187],
    [351, 287],
    [182, 399],
  ],
  base: [
    [341, 190],
    [510, 78],
    [677, 178],
    [508, 290],
  ],
  ai: [
    [341, 451],
    [510, 339],
    [677, 439],
    [508, 551],
  ],
};
function point(corners: Point[], u: number, v: number): Point {
  const [a, b, , d] = corners;
  return [
    a[0] + (b[0] - a[0]) * u + (d[0] - a[0]) * v,
    a[1] + (b[1] - a[1]) * u + (d[1] - a[1]) * v,
  ];
}
function position(key: string, index: number): Point {
  return point(planes[key], ((index % 10) + 0.55) / 10, (Math.floor(index / 10) + 0.55) / 6);
}

export function TwoPaths({ audit }: { audit?: ResearchEvent[] }) {
  const count = audit?.length;
  const accepted = audit?.filter((e) => e.jev_accept).length;
  return (
    <figure className="experiment-art">
      <svg viewBox="0 0 710 610" role="img" aria-labelledby="paths-title paths-desc">
        <title id="paths-title">Same signals, two admission paths</title>
        <desc id="paths-desc">
          {audit
            ? `${count} entry opportunities. Unfiltered admits all ${count}; Jev admits ${accepted} and skips ${count! - accepted!}. This is a schematic, not a performance chart.`
            : "Method schematic: the same strategy signals enter an unfiltered policy or an AI entry gate. Results are withheld pending data-publication permission."}
        </desc>
        <path
          className="art-rule"
          d="M8 426H258M266 11H679M687 46V577M315 582H678"
          strokeDasharray="2 8"
        />
        {audit?.map((event, i) => {
          const [x, y] = position("source", i),
            [bx, by] = position("base", i),
            [ax, ay] = position("ai", i);
          return (
            <g key={event.event_id}>
              <path
                className="art-track"
                d={`M${x} ${y}C${x + 150} ${y - 90} ${bx - 90} ${by + 55} ${bx} ${by}`}
              />
              {event.jev_accept && (
                <path
                  className="art-track ai"
                  d={`M${x} ${y}C${x + 110} ${y + 50} ${ax - 95} ${ay - 80} ${ax} ${ay}`}
                />
              )}
            </g>
          );
        })}
        {Object.entries(planes).map(([key, corners]) => (
          <g key={key}>
            <polygon
              className={`art-board-bottom ${key === "ai" ? "ai" : ""}`}
              points={corners.map(([x, y]) => `${x},${y + 10}`).join(" ")}
            />
            <polygon
              className={`art-board ${key === "ai" ? "ai" : ""}`}
              points={corners.map(([x, y]) => `${x},${y}`).join(" ")}
            />
            {Array.from({ length: 9 }, (_, i) => {
              const a = point(corners, (i + 1) / 10, 0),
                b = point(corners, (i + 1) / 10, 1);
              return (
                <path key={`u${i}`} className="art-grid" d={`M${a.join(" ")}L${b.join(" ")}`} />
              );
            })}
            {Array.from({ length: 5 }, (_, i) => {
              const a = point(corners, 0, (i + 1) / 6),
                b = point(corners, 1, (i + 1) / 6);
              return (
                <path key={`v${i}`} className="art-grid" d={`M${a.join(" ")}L${b.join(" ")}`} />
              );
            })}
            {audit?.map((event, i) => {
              const [x, y] = position(key, i),
                rejected = key === "ai" && !event.jev_accept,
                offset = rejected ? 0 : 7;
              return (
                <g key={event.event_id}>
                  {offset > 0 && <path className="art-stem" d={`M${x} ${y}v-${offset}`} />}
                  <ellipse
                    className={`art-dot ${rejected ? "rejected" : key === "ai" ? "ai" : ""}`}
                    cx={x}
                    cy={y - offset}
                    rx="4.2"
                    ry="3.5"
                  />
                </g>
              );
            })}
          </g>
        ))}
        <text className="art-small" x="14" y="155">
          Same strategy. Same opportunities.
        </text>
        <text className="art-number" x="14" y="196">
          {count ?? "→"}
        </text>
        <text className="art-label" x="70" y="195">
          entry signals
        </text>
        <text className="art-label" x="408" y="39">
          Unfiltered
        </text>
        <text className="art-small" x="408" y="60">
          {count ? `${count} entries · nothing gated` : "Every eligible entry"}
        </text>
        <text className="art-label ai" x="354" y="329">
          With Jev
        </text>
        <text className="art-small" x="354" y="350">
          {count
            ? `${accepted} admitted · ${count - accepted!} skipped`
            : "Admit or skip each entry"}
        </text>
        <path className="art-rule" d="M32 439V498H257" />
        <text className="art-small" x="32" y="530">
          One decision changes the path.
        </text>
        <circle cx="662" cy="31" r="12" className="art-rule" />
        <path className="art-rule" d="M654 31h16M662 23v16" />
      </svg>
      {audit && (
        <div className="art-mobile-key" aria-hidden="true">
          <span>{count} unfiltered entries</span>
          <span>
            <b>{accepted}</b> Jev entries
          </span>
        </div>
      )}
      <figcaption>
        {audit
          ? "Schematic · each point is one entry opportunity"
          : "Method schematic · research results unavailable"}
      </figcaption>
    </figure>
  );
}
