// @vitest-environment node
import { afterEach, expect, test, vi } from "vitest";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { syntheticEvidence } from "@/test/fixtures";
vi.mock("server-only", () => ({}));
vi.mock("node:fs/promises", () => ({ readFile: vi.fn() }));
import { loadEvidence, publicationApproved } from "./server";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
function files(data = syntheticEvidence(), digest?: string) {
  const raw = JSON.stringify(data);
  vi.mocked(readFile).mockImplementation(async (path) =>
    String(path).endsWith(".sha256")
      ? (digest ?? createHash("sha256").update(raw).digest("hex"))
      : raw,
  );
}
test("production defaults to withheld and does not read private files", async () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("EDISON_EVIDENCE_MODE", "withheld");
  vi.stubEnv("EDISON_PUBLIC_EVIDENCE_APPROVED", "false");
  expect(await loadEvidence()).toEqual({ status: "unavailable", reason: "withheld" });
  expect(readFile).not.toHaveBeenCalled();
});
test.each([
  ["true", ""],
  ["true", " \n "],
  ["false", "docs/PUBLICATION.md#hfiex-derived-evidence-approval"],
  ["TRUE", "docs/PUBLICATION.md#hfiex-derived-evidence-approval"],
])("incomplete approval (%s, %s) stays withheld without reading files", async (flag, ref) => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("EDISON_EVIDENCE_MODE", "withheld");
  vi.stubEnv("EDISON_PUBLIC_EVIDENCE_APPROVED", flag);
  vi.stubEnv("EDISON_EVIDENCE_PERMISSION_REF", ref);
  expect(publicationApproved()).toBe(false);
  expect(await loadEvidence()).toEqual({ status: "unavailable", reason: "withheld" });
  expect(readFile).not.toHaveBeenCalled();
});
test("local mode validates a digest and contract without approving publication", async () => {
  vi.stubEnv("EDISON_EVIDENCE_MODE", "local");
  vi.stubEnv("EDISON_PUBLIC_EVIDENCE_APPROVED", "false");
  files();
  const state = await loadEvidence();
  expect(state.status).toBe("available");
  if (state.status === "available") expect(state.publicationApproved).toBe(false);
});
test("explicit approval plus documented reference enables only valid evidence", async () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("EDISON_EVIDENCE_MODE", "withheld");
  vi.stubEnv("EDISON_PUBLIC_EVIDENCE_APPROVED", "true");
  vi.stubEnv(
    "EDISON_EVIDENCE_PERMISSION_REF",
    "docs/PUBLICATION.md#hfiex-derived-evidence-approval",
  );
  files();
  const state = await loadEvidence();
  expect(state.status).toBe("available");
  if (state.status === "available") expect(state.publicationApproved).toBe(true);
});
test.each([false, true])(
  "digest/missing/schema failures never substitute data (approved=%s)",
  async (approved) => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("EDISON_EVIDENCE_MODE", approved ? "withheld" : "local");
    vi.stubEnv("EDISON_PUBLIC_EVIDENCE_APPROVED", String(approved));
    vi.stubEnv(
      "EDISON_EVIDENCE_PERMISSION_REF",
      "docs/PUBLICATION.md#hfiex-derived-evidence-approval",
    );
    files(undefined, "bad digest");
    expect(await loadEvidence()).toEqual({ status: "unavailable", reason: "invalid" });
    const bad = syntheticEvidence();
    Object.assign(bad, { market_price_reserve_read: true });
    files(bad);
    expect(await loadEvidence()).toEqual({ status: "unavailable", reason: "invalid" });
    vi.mocked(readFile).mockRejectedValue(Object.assign(new Error("Missing"), { code: "ENOENT" }));
    expect(await loadEvidence()).toEqual({ status: "unavailable", reason: "missing" });
  },
);
