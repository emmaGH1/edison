"use client";
import { useEffect, useId, useRef, useState } from "react";
import { CornerDownLeft, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  routeResultSchema,
  intentLabels,
  targetFor,
  type RouteResult,
  type Target,
} from "@/lib/routing/intents";

export function QuestionRouter({
  enabled,
  onNavigate,
}: {
  enabled: boolean;
  onNavigate: (target: Target) => void;
}) {
  const id = useId(),
    [question, setQuestion] = useState(""),
    [busy, setBusy] = useState(false);
  const [result, setResult] = useState<RouteResult | null>(null),
    [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function submit() {
    if (controller.current) return;
    const request = new AbortController();
    controller.current = request;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(6000)]),
      });
      if (!response.ok) throw new Error("Routing unavailable");
      const parsed = routeResultSchema.safeParse(await response.json());
      if (!parsed.success) throw new Error("Unexpected route");
      setResult(parsed.data);
      if (parsed.data.type === "route") onNavigate(targetFor(parsed.data.intent));
    } catch {
      if (!request.signal.aborted)
        setError(
          "Couldn’t route that question. Use the view navigation or shortcuts; no research result has changed.",
        );
    } finally {
      controller.current = null;
      if (!request.signal.aborted) setBusy(false);
    }
  }
  return (
    <div className="question-router">
      <form
        className="question-box"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <ScanSearch size={17} aria-hidden="true" />
        <label htmlFor={id} className="sr-only">
          Question about the frozen research
        </label>
        <input
          id={id}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Did Jev actually improve this strategy?"
          minLength={3}
          maxLength={280}
          required
          autoComplete="off"
        />
        <Button type="submit" disabled={busy}>
          {busy ? "Finding…" : "Find evidence"}
          <CornerDownLeft size={13} aria-hidden="true" />
        </Button>
      </form>
      <p className="question-meta">
        {enabled
          ? "Free Jev routing enabled. Submitting sends your question to OpenCode; don’t include secrets or personal data."
          : "Rule-based navigation. Live Jev routing is disabled; historical Jev decisions remain separate."}{" "}
        Questions aren’t saved by Edison.
      </p>
      <div className="question-chips">
        {(["missed_winners", "avoided_losses", "costs", "evidence_limits"] as const).map(
          (intent) => (
            <button
              key={intent}
              onClick={() => {
                setResult(null);
                setError("");
                onNavigate(targetFor(intent));
              }}
            >
              {intentLabels[intent]}
            </button>
          ),
        )}
      </div>
      {(result || error) && (
        <div className="route-feedback" role="status">
          {error ? (
            <p>{error}</p>
          ) : result?.type === "route" ? (
            <>
              <strong>{intentLabels[result.intent]}</strong>
              <p>
                {result.engine === "jev"
                  ? "Jev selected this evidence view. All numbers come from the frozen bundle."
                  : result.engine === "fallback"
                    ? "Jev was unavailable; rule-based navigation opened this view. No paid fallback."
                    : "Opened with rule-based navigation, not a new AI decision."}
              </p>
            </>
          ) : result?.type === "unsupported" ? (
            <>
              <strong>Outside this study.</strong>
              <p>
                No trades, predictions, arbitrary data queries or changes to research results. Use
                the supported evidence views.
              </p>
            </>
          ) : result?.type === "choice" ? (
            <>
              <strong>
                {result.reason === "low_confidence"
                  ? "Jev wasn’t confident enough to route."
                  : "Which evidence do you mean?"}
              </strong>
              <p>Choose a view explicitly; no answer or metric has been generated.</p>
              <div className="route-choices">
                {result.choices.map((intent) => (
                  <Button
                    key={intent}
                    variant="outline"
                    onClick={() => {
                      setResult(null);
                      onNavigate(targetFor(intent));
                    }}
                  >
                    {intentLabels[intent]}
                  </Button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
