import "server-only";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { gunzipSync } from "node:zlib";
import { evidenceSchema, type EvidenceState } from "./schema";

const MAX_EVIDENCE_BYTES = 500000;
const MAX_ENCODED_BYTES = 60000;

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
    const encoded = process.env.EDISON_EVIDENCE_GZIP_BASE64;
    const envDigest = process.env.EDISON_EVIDENCE_SHA256;
    let raw: string;
    let digest: string;
    if (encoded !== undefined || envDigest !== undefined) {
      if (
        !encoded ||
        !envDigest ||
        encoded.length > MAX_ENCODED_BYTES ||
        !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded) ||
        encoded.length % 4 !== 0
      )
        return { status: "unavailable", reason: "invalid" };
      const compressed = Buffer.from(encoded, "base64");
      if (compressed.toString("base64") !== encoded)
        return { status: "unavailable", reason: "invalid" };
      raw = gunzipSync(compressed, { maxOutputLength: MAX_EVIDENCE_BYTES }).toString("utf8");
      digest = envDigest;
    } else {
      [raw, digest] = await Promise.all([
        readFile(/*turbopackIgnore: true*/ path, "utf8"),
        readFile(/*turbopackIgnore: true*/ `${path}.sha256`, "utf8"),
      ]);
    }
    if (
      Buffer.byteLength(raw, "utf8") > MAX_EVIDENCE_BYTES ||
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
