// @vitest-environment node
import { afterEach, expect, test, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { GET } from "./route";
afterEach(() => vi.unstubAllGlobals());
test("rejects arbitrary symbols without contacting Bitget", async () => {
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  expect((await GET(new Request("http://edison.test/api/context?symbol=BTCUSDT"))).status).toBe(
    400,
  );
  expect(fetcher).not.toHaveBeenCalled();
});
test("filters public metadata, retains retrieval time and caches repeated requests", async () => {
  const row = {
    symbol: "RAAPLUSDT",
    baseCoin: "RAAPL",
    quoteCoin: "USDT",
    minTradeUSDT: "1",
    makerFeeRate: ".001",
    takerFeeRate: ".001",
    pricePrecision: "4",
    quantityPrecision: "6",
    status: "online",
    unrelated: "not returned",
  };
  row.makerFeeRate = "0.001";
  row.takerFeeRate = "0.001";
  const fetcher = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify({ code: "00000", data: [row] })));
  vi.stubGlobal("fetch", fetcher);
  const response = await GET(new Request("http://edison.test/api/context?symbol=RAAPLUSDT"));
  expect(response.status).toBe(200);
  const snapshot = await response.json();
  expect(snapshot.data.unrelated).toBeUndefined();
  expect(snapshot.cached).toBe(false);
  const cached = await (
    await GET(new Request("http://edison.test/api/context?symbol=RAAPLUSDT"))
  ).json();
  expect(cached.cached).toBe(true);
  expect(cached.retrievedAt).toBe(snapshot.retrievedAt);
  expect(fetcher).toHaveBeenCalledTimes(1);
});
test("network errors return unavailable instead of fabricated trading constraints", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Unavailable")));
  const response = await GET(new Request("http://edison.test/api/context?symbol=RNVDAUSDT"));
  expect(response.status).toBe(502);
  expect((await response.json()).data).toBeUndefined();
});
