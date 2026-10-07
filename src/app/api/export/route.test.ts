// @vitest-environment node
import { expect, test, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/evidence/server", () => ({ loadEvidence: vi.fn(), publicationApproved: vi.fn() }));
import { loadEvidence, publicationApproved } from "@/lib/evidence/server";
import { syntheticEvidence } from "@/test/fixtures";
import { GET } from "./route";
test("withheld export does not read the local bundle or reveal a selected event", async () => {
  vi.mocked(publicationApproved).mockReturnValue(false);
  const response = await GET(
    new Request(
      "http://edison.test/api/export?view=audit&filter=missed_winners&event=ffffffffffffffff",
    ),
  );
  expect(response.status).toBe(200);
  const note = await response.text();
  expect(note).toContain("Method-only");
  expect(note).not.toContain("ffffffffffffffff");
  expect(loadEvidence).not.toHaveBeenCalled();
  expect(response.headers.get("Content-Disposition")).toContain("attachment");
});
test("only explicit publication approval returns derived summary", async () => {
  vi.mocked(publicationApproved).mockReturnValue(true);
  vi.mocked(loadEvidence).mockResolvedValue({
    status: "available",
    evidence: syntheticEvidence(),
    publicationApproved: true,
  });
  expect(
    await (await GET(new Request("http://edison.test/api/export?view=comparison"))).text(),
  ).toContain("Captured development comparison");
});
test("rejects unsupported selections and duplicated parameters", async () => {
  expect((await GET(new Request("http://edison.test/api/export?view=orders"))).status).toBe(400);
  expect(
    (await GET(new Request("http://edison.test/api/export?view=audit&view=method"))).status,
  ).toBe(400);
  expect((await GET(new Request("http://edison.test/api/export?question=anything"))).status).toBe(
    400,
  );
});
