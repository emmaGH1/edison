import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, FlaskConical } from "lucide-react";
import { Brand } from "@/components/brand";
import { TwoPaths } from "@/components/two-paths";
import { loadEvidence } from "@/lib/evidence/server";
import { pct } from "@/lib/evidence/selectors";

export default async function Home() {
  await connection();
  const state = await loadEvidence();
  const evidence = state.status === "available" ? state.evidence : null;
  return (
    <div className="landing">
      <header className="site-nav">
        <Brand />
        <nav className="nav-links" aria-label="Main navigation">
          <Link href="/research">The experiment</Link>
          <Link href="/research?view=audit">The decisions</Link>
          <Link href="/research?view=method">The method</Link>
        </nav>
        <Link className="btn btn-dark nav-cta" href="/research">
          Open research <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </header>
      <main id="main-content" tabIndex={-1}>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <FlaskConical size={17} aria-hidden="true" />
              Research, not predictions
            </p>
            <h1 id="hero-title">
              AI made a call.<span>Look closer.</span>
            </h1>
            <p className="hero-question">Did AI improve this strategy—or just trade less?</p>
            <p className="hero-deck">
              Same signals. Two paths. Explore the losses Jev avoided, the winners it missed, and
              the evidence behind the result.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/research">
                Open the experiment <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link className="text-btn" href="/research?view=method">
                How it works <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <p className="hero-note">
              One fixed five-stock study. No live trades. No promised edge.
            </p>
          </div>
          <TwoPaths audit={evidence?.audit} />
        </section>
        <dl className="scope-strip">
          <div>
            <dt>Research universe</dt>
            <dd>AAPL · MSFT · NVDA · AMZN · GOOGL</dd>
          </div>
          <div>
            <dt>Evidence window</dt>
            <dd>2021–2024 · native stocks</dd>
          </div>
          <div>
            <dt>Modeled transaction costs</dt>
            <dd>10 bps per side</dd>
          </div>
          <div>
            <dt>{evidence ? "The experiment’s verdict" : "Evidence availability"}</dt>
            <dd>{evidence ? "AI improvement not proven" : "Publication permission pending"}</dd>
          </div>
        </dl>
        {evidence ? (
          <section className="landing-proof" aria-labelledby="proof-title">
            <div>
              <h2 id="proof-title">
                A safer-looking result.
                <br />A harder question.
              </h2>
              <p>
                Jev reduced drawdown. It also left more capital in cash and earned less. Edison lets
                you inspect that trade-off.
              </p>
            </div>
            <div className="proof-result">
              <div>
                <h3>Worst drawdown, with Jev</h3>
                <strong>{pct(evidence.results.jev.max_drawdown_daily_close)}</strong>
                <small>
                  vs {pct(evidence.results.crossover.max_drawdown_daily_close)} unfiltered
                </small>
              </div>
              <div>
                <h3>Annualized return, with Jev</h3>
                <strong>{pct(evidence.results.jev.cagr)}</strong>
                <small>vs {pct(evidence.results.crossover.cagr)} unfiltered</small>
              </div>
            </div>
          </section>
        ) : (
          <section className="landing-proof">
            <div>
              <h2>
                Inspect the method.
                <br />
                Respect the boundary.
              </h2>
              <p>
                The research bundle is withheld while publication rights are unresolved. No
                substitute results are shown. You can explore the protocol and export a method-only
                note.
              </p>
            </div>
          </section>
        )}
      </main>
      <footer className="sample-foot">
        <span>Edison — See whether AI actually helped.</span>
        <span>
          {state.status === "available" && state.publicationApproved
            ? "Captured development evidence · no live market feed"
            : "Evidence publication withheld · no live market feed"}
        </span>
      </footer>
    </div>
  );
}
