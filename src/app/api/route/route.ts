import { NextResponse } from "next/server";
import { boundedText, noStoreHeaders, takeRequest } from "@/lib/server/guards";
import { questionSchema, ruleRoute, type RouteResult } from "@/lib/routing/intents";
import { classifyWithJev } from "@/lib/routing/jev";

function hasSameOrigin(request: Request) {
  try {
    const origin = new URL(request.headers.get("origin") ?? "");
    const target = new URL(request.url);
    const host = request.headers.get("host") ?? target.host;
    if (origin.host !== host) return false;
    const protocol =
      request.headers.get("x-forwarded-proto")?.split(",")[0] ?? target.protocol.slice(0, -1);
    return origin.protocol === protocol + ":";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request))
    return NextResponse.json(
      { error: "Same-origin request required." },
      { status: 403, headers: noStoreHeaders },
    );
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return NextResponse.json({ error: "JSON required." }, { status: 415, headers: noStoreHeaders });
  if (!takeRequest("routing", 12))
    return NextResponse.json(
      { error: "Request limit reached. Use the research navigation." },
      { status: 429, headers: { ...noStoreHeaders, "Retry-After": "60" } },
    );
  try {
    const parsed = questionSchema.safeParse(JSON.parse(await boundedText(request.body, 2048)));
    if (!parsed.success)
      return NextResponse.json(
        { error: "Use a question between 3 and 280 characters." },
        { status: 400, headers: noStoreHeaders },
      );
    const local = ruleRoute(parsed.data.question);
    let result: RouteResult;
    if (local.type === "unsupported") result = local;
    else if (local.type === "choice") result = { ...local, reason: "ambiguous" };
    else if (process.env.EDISON_JEV_ENABLED !== "true") result = { ...local, engine: "rules" };
    else {
      const classified = await classifyWithJev(parsed.data.question);
      if (!classified) result = { ...local, engine: "fallback" };
      else if (classified.confidence < 0.7)
        result = { type: "choice", choices: [local.intent], reason: "low_confidence" };
      else if (classified.intent === "unsupported") result = { type: "unsupported" };
      else result = { type: "route", intent: classified.intent, engine: "jev" };
    }
    return NextResponse.json(result, { headers: noStoreHeaders });
  } catch {
    return NextResponse.json(
      { error: "Invalid or oversized question. Use the navigation instead." },
      { status: 400, headers: noStoreHeaders },
    );
  }
}
