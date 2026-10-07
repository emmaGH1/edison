import { NextResponse } from "next/server";
import { z } from "zod";
import { tokenSymbols, venueSchema, type TokenSymbol } from "@/lib/bitget";
import { boundedText, noStoreHeaders, takeRequest } from "@/lib/server/guards";

const snapshots = new Map<
  TokenSymbol,
  { data: z.infer<typeof venueSchema>; retrievedAt: string; expires: number }
>();
const responseSchema = z.object({ code: z.literal("00000"), data: z.array(venueSchema).length(1) });
export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const symbol = z.enum(tokenSymbols).safeParse(query.get("symbol"));
  if (!symbol.success || [...query.keys()].some((key) => key !== "symbol"))
    return NextResponse.json(
      { error: "Choose a supported token symbol." },
      { status: 400, headers: noStoreHeaders },
    );
  const cached = snapshots.get(symbol.data);
  if (cached && cached.expires > Date.now())
    return NextResponse.json(
      { data: cached.data, retrievedAt: cached.retrievedAt, cached: true },
      { headers: noStoreHeaders },
    );
  if (!takeRequest("context", 10))
    return NextResponse.json(
      { error: "Metadata request limit reached. No orders were placed." },
      { status: 429, headers: { ...noStoreHeaders, "Retry-After": "60" } },
    );
  try {
    const response = await fetch(
      `https://api.bitget.com/api/v2/spot/public/symbols?symbol=${symbol.data}`,
      { cache: "no-store", signal: AbortSignal.timeout(4000) },
    );
    if (!response.ok) throw new Error("Provider unavailable");
    const parsed = responseSchema.parse(JSON.parse(await boundedText(response.body, 24000)));
    if (parsed.data[0].symbol !== symbol.data) throw new Error("Unexpected symbol");
    const snapshot = {
      data: parsed.data[0],
      retrievedAt: new Date().toISOString(),
      expires: Date.now() + 600000,
    };
    snapshots.set(symbol.data, snapshot);
    return NextResponse.json(
      { data: snapshot.data, retrievedAt: snapshot.retrievedAt, cached: false },
      { headers: noStoreHeaders },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "Bitget metadata unavailable. Native-stock research is unchanged; no live trading is connected.",
      },
      { status: 502, headers: noStoreHeaders },
    );
  }
}
