import prisma from '../../db/client';
import { fetchSimplePrices } from './coingecko.client';

export type SupportedCurrency = 'EUR' | 'USD';

type CacheEntry = {
  data: Record<string, number | null>; // symbol -> price or null
  expiresAt: number; // epoch ms
};

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, CacheEntry>();

const cacheKey = (symbols: string[], currency: SupportedCurrency) =>
  `${currency}|${[...symbols].sort().join(',')}`;

export async function getPrices(
  symbols: string[],
  currency: SupportedCurrency,
): Promise<Record<string, number | null>> {
  const key = cacheKey(symbols, currency);
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) {
    return hit.data;
  }

  const upperSymbols = symbols.map((s) => s.toUpperCase());
  const assets = await prisma.asset.findMany({
    where: { symbol: { in: upperSymbols } },
    select: { id: true, symbol: true, coingeckoId: true },
  });

  const symbolToAsset = new Map(assets.map((a) => [a.symbol, a] as const));
  const ids = assets.map((a) => a.coingeckoId);

  // Fetch from CoinGecko
  const cg = await fetchSimplePrices(ids, currency.toLowerCase() as 'eur' | 'usd', {
    timeoutMs: 6000,
  });

  // Map back to symbols; fallback null for missing
  const data: Record<string, number | null> = {};
  for (const sym of upperSymbols) {
    const asset = symbolToAsset.get(sym);
    if (!asset) {
      data[sym] = null;
      continue;
    }
    data[sym] = cg[asset.coingeckoId] ?? null;
  }

  cache.set(key, { data, expiresAt: now + CACHE_TTL_MS });

  // Persist snapshot asynchronously (best-effort)
  void persistSnapshot(data, symbolToAsset, currency);

  return data;
}

async function persistSnapshot(
  data: Record<string, number | null>,
  symbolToAsset: Map<string, { id: string; symbol: string; coingeckoId: string }>,
  currency: SupportedCurrency,
) {
  try {
    const entries = Object.entries(data)
      .filter(([, price]) => typeof price === 'number' && price !== null)
      .map(([symbol, price]) => ({ symbol, price: price as number }));

    if (entries.length === 0) return;

    const now = new Date();
    await prisma.price.createMany({
      data: entries.map(({ symbol, price }) => ({
        assetId: symbolToAsset.get(symbol)!.id,
        currency,
        price,
        fetchedAt: now,
        source: 'coingecko',
        createdAt: now,
      })),
    });
  } catch {
    // swallow errors; persistence is best-effort
  }
}

