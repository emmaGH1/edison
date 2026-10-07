"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { tokenSymbols, venueResultSchema, type TokenSymbol, type VenueResult } from "@/lib/bitget";

export function VenueContext() {
  const [symbol, setSymbol] = useState<TokenSymbol>("RAAPLUSDT");
  const [snapshot, setSnapshot] = useState<VenueResult | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function load() {
    if (controller.current) return;
    const request = new AbortController();
    controller.current = request;
    setBusy(true);
    setError("");
    setSnapshot(null);
    try {
      const response = await fetch("/api/context?symbol=" + symbol, {
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(6000)]),
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Unavailable");
      const parsed = venueResultSchema.safeParse(await response.json());
      if (!parsed.success || parsed.data.data.symbol !== symbol)
        throw new Error("Invalid metadata");
      setSnapshot(parsed.data);
    } catch {
      if (!request.signal.aborted)
        setError(
          "Bitget constraints couldn’t load. No substitute metadata or orders; native-stock evidence is unchanged.",
        );
    } finally {
      controller.current = null;
      if (!request.signal.aborted) setBusy(false);
    }
  }
  return (
    <section className="panel method-section">
      <h2>Bitget context is a separate evidence layer.</h2>
      <p>
        Read-only venue constraints, not a market feed or token backtest. Load public metadata only
        when requested.
      </p>
      <div className="bitget-controls">
        <label className="sr-only" htmlFor="token-symbol">
          Token symbol
        </label>
        <select
          id="token-symbol"
          value={symbol}
          disabled={busy}
          onChange={(event) => {
            setSymbol(event.target.value as TokenSymbol);
            setSnapshot(null);
            setError("");
          }}
        >
          {tokenSymbols.map((token) => (
            <option key={token}>{token}</option>
          ))}
        </select>
        <Button variant="outline" disabled={busy} onClick={load}>
          {busy ? "Loading…" : "Load constraints"}
        </Button>
      </div>
      {error && <p role="status">{error}</p>}
      {snapshot && (
        <>
          <div className="table-scroll">
            <table>
              <caption>
                {snapshot.data.symbol} · metadata retrieved{" "}
                {new Date(snapshot.retrievedAt).toLocaleString("en-GB", { timeZone: "UTC" })} UTC
                {snapshot.cached ? " · cached (up to 10 minutes)" : ""}
              </caption>
              <tbody>
                <tr>
                  <th scope="row">Reported symbol status</th>
                  <td>{snapshot.data.status}</td>
                </tr>
                <tr>
                  <th scope="row">Minimum notional</th>
                  <td>{snapshot.data.minTradeUSDT} USDT</td>
                </tr>
                <tr>
                  <th scope="row">Default maker / taker fee</th>
                  <td>
                    {(Number(snapshot.data.makerFeeRate) * 100).toFixed(3)}% /{" "}
                    {(Number(snapshot.data.takerFeeRate) * 100).toFixed(3)}%
                  </td>
                </tr>
                <tr>
                  <th scope="row">Price / quantity decimals</th>
                  <td>
                    {snapshot.data.pricePrecision} / {snapshot.data.quantityPrecision}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Default fee rates may differ by account. Fees alone do not calibrate our all-in
            spread/slippage assumption. Symbol status is provider metadata—not a connection to
            trading.
          </p>
        </>
      )}
      <p>
        Native results do not establish token liquidity, fills, tracking, redemption or
        corporate-action equivalence. Both reserves remain closed.
      </p>
    </section>
  );
}
