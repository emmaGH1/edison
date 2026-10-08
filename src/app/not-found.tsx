import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main-content" className="error-page">
      <p className="eyebrow">Outside the experiment</p>
      <h1>This view doesn’t exist.</h1>
      <p>Edison supports one bounded research case.</p>
      <Link className="btn btn-primary" href="/research">
        Open research
      </Link>
    </main>
  );
}
