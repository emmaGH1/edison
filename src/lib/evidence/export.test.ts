import { expect, test } from "vitest";
import { buildResearchNote } from "./export";
import { syntheticEvidence } from "@/test/fixtures";

test("method-only note excludes results, events and equity while preserving scope", () => {
  const note = buildResearchNote({
    view: "audit",
    filter: "missed_winners",
    evidence: null,
    eventId: "ffffffffffffffff",
    generatedAt: "test time",
  });
  expect(note).toContain("Method-only");
  expect(note).toContain("Selected view: audit");
  expect(note).toContain("No arbitrary interpolation");
  expect(note).not.toContain("ffffffffffffffff");
  expect(note).not.toContain("Captured development comparison");
  expect(note).not.toContain("Source integrity receipts");
  expect(note).toContain("hfdatalibrary.com/pages/license");
  expect(note).toContain("Data provided for free by IEX.");
});
test("explicitly permitted note references captured metrics and only the selected event", () => {
  const data = syntheticEvidence();
  const note = buildResearchNote({
    view: "comparison",
    filter: "all",
    evidence: data,
    eventId: data.audit[21].event_id,
    generatedAt: "test time",
  });
  expect(note).toContain("Advancement gate: failed");
  expect(note).toContain(data.audit[21].event_id);
  expect(note).not.toContain("Event ID: " + data.audit[0].event_id);
  expect(note).toContain("SHA-256");
  expect(note).not.toContain('"equity":');
});
