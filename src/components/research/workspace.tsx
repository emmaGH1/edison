"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChartNoAxesCombined,
  FileDown,
  FileText,
  Fingerprint,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import type { EvidenceState, ResearchEvent } from "@/lib/evidence/schema";
import {
  completedTrades,
  matchesFilter,
  parseFilter,
  parseView,
  type FilterId,
  type ViewId,
} from "@/lib/evidence/selectors";
import type { Target } from "@/lib/routing/intents";
import { dataAttribution, hfCitation } from "@/lib/protocol";
import { Comparison } from "./comparison";
import { Audit } from "./audit";
import { Method } from "./method";
import { Inspector } from "./inspector";
import { QuestionRouter } from "./question-router";

const titles: Record<ViewId, string> = {
  comparison: "Did AI improve the strategy?",
  audit: "Where did Jev say yes—or no?",
  method: "How much can this evidence tell us?",
};
const descriptions: Record<ViewId, string> = {
  comparison: "Four policies. Same research case. An inspectable trade-off.",
  audit: "Captured entry decisions against completed baseline outcomes.",
  method: "The protocol, assumptions and boundary of the claim.",
};
const nav = [
  { view: "comparison", label: "Comparison", icon: ChartNoAxesCombined },
  { view: "audit", label: "Decision audit", icon: Fingerprint },
  { view: "method", label: "Method & limits", icon: FileText },
] as const;

export function ResearchWorkspace({
  state,
  initialView,
  initialFilter,
  initialEvent,
  jevEnabled,
}: {
  state: EvidenceState;
  initialView: ViewId;
  initialFilter: FilterId;
  initialEvent?: string;
  jevEnabled: boolean;
}) {
  const evidence = state.status === "available" ? state.evidence : null;
  const approved = state.status === "available" && state.publicationApproved;
  const trades = evidence ? completedTrades(evidence) : [];
  function validSelection(id: string | undefined, filter: FilterId) {
    return (
      trades.find((event) => event.event_id === id && matchesFilter(event, filter))?.event_id ||
      trades.find(
        (event) =>
          event.event_id === evidence?.featured_event_ids[0] && matchesFilter(event, filter),
      )?.event_id ||
      trades.find((event) => matchesFilter(event, filter))?.event_id
    );
  }
  const [view, setView] = useState(initialView),
    [filter, setFilter] = useState(initialFilter);
  const [selectedId, setSelectedId] = useState(() => validSelection(initialEvent, initialFilter));
  const event = trades.find((trade) => trade.event_id === selectedId);
  useEffect(() => {
    const back = () => {
      const params = new URLSearchParams(window.location.search),
        nextFilter = parseFilter(params.get("filter"));
      setView(parseView(params.get("view")));
      setFilter(nextFilter);
      setSelectedId(params.get("event") || undefined);
    };
    window.addEventListener("popstate", back);
    return () => window.removeEventListener("popstate", back);
  }, []);
  function writeUrl(nextView: ViewId, nextFilter: FilterId, id?: string, replace = false) {
    const params = new URLSearchParams({ view: nextView });
    if (nextView === "audit") params.set("filter", nextFilter);
    if (id) params.set("event", id);
    window.history[replace ? "replaceState" : "pushState"](
      {},
      "",
      "/research?" + params.toString(),
    );
  }
  function navigate(target: Target) {
    const nextFilter = target.filter ?? filter,
      nextId = validSelection(selectedId, nextFilter);
    setView(target.view);
    setFilter(nextFilter);
    setSelectedId(nextId);
    writeUrl(target.view, nextFilter, nextId);
    requestAnimationFrame(() => {
      const heading = document.getElementById(target.focus || "workspace-title");
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({ block: "start" });
    });
  }
  function changeFilter(nextFilter: FilterId) {
    const nextId = validSelection(selectedId, nextFilter);
    setFilter(nextFilter);
    setSelectedId(nextId);
    writeUrl(view, nextFilter, nextId, true);
  }
  function select(next: ResearchEvent) {
    setSelectedId(next.event_id);
    writeUrl(view, filter, next.event_id, true);
    if (window.matchMedia("(max-width: 1080px)").matches)
      requestAnimationFrame(() => {
        const heading = document.getElementById("inspector-title");
        heading?.focus({ preventScroll: true });
        heading?.scrollIntoView({ block: "start" });
      });
  }
  const exportParams = new URLSearchParams({ view, filter });
  if (event) exportParams.set("event", event.event_id);
  return (
    <div className="lab">
      <header className="lab-topbar">
        <div className="lab-crumb">
          <Brand />
          <span>/</span>
          <b>Research workspace</b>
        </div>
        <div className="lab-actions">
          <Link className="text-btn" href="/">
            <ArrowLeft size={14} aria-hidden="true" />
            Overview
          </Link>
          <Button
            variant="outline"
            aria-label="Print current research view"
            onClick={() => window.print()}
          >
            <Printer size={15} />
          </Button>
          <a className="btn btn-dark" href={"/api/export?" + exportParams.toString()} download>
            <FileDown size={14} aria-hidden="true" />
            Export note
          </a>
        </div>
      </header>
      <div className="lab-grid">
        <aside className="lab-sidebar">
          <p className="sidebar-label">The experiment</p>
          <nav className="sidebar-nav" aria-label="Research views">
            {nav.map((item) => (
              <Button
                key={item.view}
                variant="ghost"
                className={view === item.view ? "active" : undefined}
                aria-current={view === item.view ? "page" : undefined}
                onClick={() => navigate({ view: item.view })}
              >
                <item.icon size={16} aria-hidden="true" />
                {item.label}
              </Button>
            ))}
          </nav>
          <div className="sidebar-card">
            <strong>One fixed study.</strong>
            <p>
              Five stocks.
              <br />
              20/50-session crossover.
              <br />
              Same opportunity set.
            </p>
            <small>
              Jun 2022–Nov 2024 · IEX-only.
              <br />
              10 bps per side.
            </small>
          </div>
          <div className="sidebar-card">
            <span className="case-badge">
              <span aria-hidden="true" />
              {evidence ? "Captured evidence" : "Evidence withheld"}
            </span>
            <small>
              No live feed. No orders.
              <br />
              Native stocks ≠ token returns.
            </small>
          </div>
        </aside>
        <main id="main-content" className="lab-main" tabIndex={-1}>
          <header className="research-header">
            <div>
              <p className="eyebrow">EDISON / RESEARCH LAB</p>
              <h1 id="workspace-title" tabIndex={-1}>
                {titles[view]}
              </h1>
              <p>{descriptions[view]}</p>
            </div>
            <span className="view-badge">Development only</span>
          </header>
          <QuestionRouter enabled={jevEnabled} onNavigate={navigate} />
          {!evidence && view !== "method" ? (
            <section className="unavailable">
              <ShieldCheck size={28} aria-hidden="true" />
              <h2>
                {state.status === "unavailable" && state.reason === "invalid"
                  ? "Evidence validation stopped this view."
                  : "Evidence publication is withheld."}
              </h2>
              <p>
                {state.status === "unavailable" && state.reason === "missing"
                  ? "The authorized local research bundle is absent. No sample numbers have been substituted."
                  : state.status === "unavailable" && state.reason === "invalid"
                    ? "The local bundle failed integrity or schema validation. No invalid result is displayed."
                    : "Evidence publication is not enabled in this runtime. The HF/IEX-only protocol is available, but results, trades and historical labels remain withheld."}
              </p>
              <Button onClick={() => navigate({ view: "method" })}>Inspect the method</Button>
            </section>
          ) : view === "comparison" && evidence ? (
            <Comparison evidence={evidence} selectedId={selectedId} onSelect={select} />
          ) : view === "audit" && evidence ? (
            <Audit
              evidence={evidence}
              filter={filter}
              selectedId={selectedId}
              onFilter={changeFilter}
              onSelect={select}
            />
          ) : (
            <Method evidence={evidence} approved={approved} />
          )}
          <footer className="lab-footer">
            Research only · hypothetical fills · no investment advice.
            <br />
            {approved
              ? "Export includes permitted derived research, not raw market-data archives."
              : "Publication withheld. Export is method-only; no derived numbers or event details."}{" "}
            A human decides whether more independent testing is justified.
            <p>{hfCitation}</p>
            <p>
              <a href="https://hfdatalibrary.com">HF Data Library</a> ·{" "}
              <a href="https://hfdatalibrary.com/pages/license">CC BY 4.0 license</a> ·{" "}
              <a href="https://doi.org/10.5281/zenodo.19501604">Dataset DOI</a>
            </p>
            <p>
              {dataAttribution} <a href="https://www.iex.io/legal/hist-data-terms">IEX terms</a>.
            </p>
          </footer>
        </main>
        <Inspector key={event?.event_id || "empty"} event={event} evidence={evidence} />
      </div>
    </div>
  );
}
