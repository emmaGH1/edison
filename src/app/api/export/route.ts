import { z } from "zod";
import { loadEvidence, publicationApproved } from "@/lib/evidence/server";
import { buildResearchNote } from "@/lib/evidence/export";
import { viewIds, filterIds } from "@/lib/evidence/selectors";
import { noStoreHeaders } from "@/lib/server/guards";

const paramsSchema = z.strictObject({
  view: z.enum(viewIds).default("comparison"),
  filter: z.enum(filterIds).default("all"),
  event: z
    .string()
    .regex(/^[a-f0-9]{16}$/)
    .optional(),
});
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const parsed = paramsSchema.safeParse(Object.fromEntries(params));
  if (!parsed.success || [...params.keys()].some((key) => params.getAll(key).length > 1))
    return new Response("Unsupported export selection.", { status: 400, headers: noStoreHeaders });
  const state = publicationApproved() ? await loadEvidence() : null;
  const evidence =
    state?.status === "available" && state.publicationApproved ? state.evidence : null;
  if (
    evidence &&
    parsed.data.event &&
    !evidence.audit.some(
      (event) => event.event_id === parsed.data.event && event.baseline_exit_date !== null,
    )
  )
    return new Response("Unknown completed event.", { status: 400, headers: noStoreHeaders });
  const note = buildResearchNote({
    view: parsed.data.view,
    filter: parsed.data.filter,
    eventId: evidence ? parsed.data.event : undefined,
    evidence,
    generatedAt: new Date().toISOString(),
  });
  return new Response(note, {
    headers: {
      ...noStoreHeaders,
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="edison-research-note.md"',
    },
  });
}
