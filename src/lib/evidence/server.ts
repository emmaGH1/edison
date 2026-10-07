import "server-only";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { evidenceSchema, type EvidenceState } from "./schema";

export function publicationApproved() {
  return (
    process.env.EDISON_PUBLIC_EVIDENCE_APPROVED === "true" &&
    Boolean(process.env.EDISON_EVIDENCE_PERMISSION_REF?.trim())
  );
}

export async function loadEvidence(): Promise<EvidenceState> {
  const approved = publicationApproved();
  const local =
    process.env.NODE_ENV === "development" || process.env.EDISON_EVIDENCE_MODE === "local";
  if (!approved && !local) return { status: "unavailable", reason: "withheld" };
  const path =
    process.env.EDISON_EVIDENCE_FILE || resolve(process.cwd(), ".edison-private/evidence.json");
  try {
    const [raw, digest] = await Promise.all([
      readFile(/*turbopackIgnore: true*/ path, "utf8"),
      readFile(/*turbopackIgnore: true*/ `${path}.sha256`, "utf8"),
    ]);
    if (
      Buffer.byteLength(raw, "utf8") > 500000 ||
      createHash("sha256").update(raw).digest("hex") !== digest.trim()
    )
      return { status: "unavailable", reason: "invalid" };
    const parsed = evidenceSchema.safeParse(JSON.parse(raw));
    return parsed.success
      ? { status: "available", evidence: parsed.data, publicationApproved: approved }
      : { status: "unavailable", reason: "invalid" };
  } catch (error) {
    const missing = error instanceof Error && "code" in error && error.code === "ENOENT";
    return { status: "unavailable", reason: missing ? "missing" : "invalid" };
  }
}
