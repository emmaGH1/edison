import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Edison overview">
      <svg
        className="mark"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 9h12M4 15h12M4 21h12M16 9l4-5M16 15l4-5M16 21l4-5" />
      </svg>
      edison
    </Link>
  );
}
