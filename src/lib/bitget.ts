import { z } from "zod";
export const tokenSymbols = [
  "RAAPLUSDT",
  "RMSFTUSDT",
  "RNVDAUSDT",
  "RAMZNUSDT",
  "RGOOGLUSDT",
] as const;
export type TokenSymbol = (typeof tokenSymbols)[number];
const decimal = z
  .string()
  .max(30)
  .regex(/^\d+(?:\.\d+)?$/);
export const venueSchema = z.object({
  symbol: z.enum(tokenSymbols),
  baseCoin: z.string().max(20),
  quoteCoin: z.literal("USDT"),
  minTradeUSDT: decimal,
  takerFeeRate: decimal.refine((v) => Number(v) <= 1),
  makerFeeRate: decimal.refine((v) => Number(v) <= 1),
  pricePrecision: z.string().regex(/^\d{1,2}$/),
  quantityPrecision: z.string().regex(/^\d{1,2}$/),
  status: z.enum(["online", "offline", "gray", "halt"]),
});
export const venueResultSchema = z.strictObject({
  data: venueSchema,
  retrievedAt: z.iso.datetime(),
  cached: z.boolean(),
});
export type VenueResult = z.infer<typeof venueResultSchema>;
