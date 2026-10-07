import { connection } from "next/server";
import { loadEvidence } from "@/lib/evidence/server";
import { parseView, parseFilter } from "@/lib/evidence/selectors";
import { ResearchWorkspace } from "@/components/research/workspace";

export default async function ResearchPage({ searchParams }: PageProps<"/research">) {
  await connection();
  const [state, params] = await Promise.all([loadEvidence(), searchParams]);
  const single = (value: string | string[] | undefined) =>
    typeof value === "string" ? value : undefined;
  return (
    <ResearchWorkspace
      state={state}
      initialView={parseView(single(params.view))}
      initialFilter={parseFilter(single(params.filter))}
      initialEvent={single(params.event)}
      jevEnabled={process.env.EDISON_JEV_ENABLED === "true"}
    />
  );
}
