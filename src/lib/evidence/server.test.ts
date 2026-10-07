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
test("approval alone does not replace a documented permission reference", () => {
  vi.stubEnv("EDISON_PUBLIC_EVIDENCE_APPROVED", "true");
  vi.stubEnv("EDISON_EVIDENCE_PERMISSION_REF", "");
  expect(publicationApproved()).toBe(false);
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
  vi.stubEnv("EDISON_PUBLIC_EVIDENCE_APPROVED", "true");
  vi.stubEnv("EDISON_EVIDENCE_PERMISSION_REF", "unit test authorization record");
  files();
  const state = await loadEvidence();
  expect(state.status).toBe("available");
  if (state.status === "available") expect(state.publicationApproved).toBe(true);
});
test("digest failures, missing files and invalid schemas never substitute data", async () => {
  vi.stubEnv("EDISON_EVIDENCE_MODE", "local");
  vi.stubEnv("EDISON_PUBLIC_EVIDENCE_APPROVED", "false");
  files(undefined, "bad digest");
  expect(await loadEvidence()).toEqual({ status: "unavailable", reason: "invalid" });
  const bad = syntheticEvidence();
  Object.assign(bad, { holdout_read: true });
  files(bad);
  expect(await loadEvidence()).toEqual({ status: "unavailable", reason: "invalid" });
  vi.mocked(readFile).mockRejectedValue(Object.assign(new Error("Missing"), { code: "ENOENT" }));
  expect(await loadEvidence()).toEqual({ status: "unavailable", reason: "missing" });
});
