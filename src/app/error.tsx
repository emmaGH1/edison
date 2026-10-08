"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main-content" className="error-page">
      <p className="eyebrow">Research unavailable</p>
      <h1>That view couldn’t load.</h1>
      <p>No result has been invented or changed. Try again, or return to the overview.</p>
      <Button onClick={reset}>Try again</Button>
      <Link href="/">Back to overview</Link>
    </main>
  );
}
