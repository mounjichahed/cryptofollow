type SupportedCurrency = 'eur' | 'usd';

export async function fetchSimplePrices(
  ids: string[],
  currency: SupportedCurrency,
  opts: { timeoutMs?: number } = {},
): Promise<Record<string, number | null>> {
  const timeoutMs = opts.timeoutMs ?? 5000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const params = new URLSearchParams({
    ids: ids.join(','),
    vs_currencies: currency,
  });

  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?${params.toString()}`,
      { signal: controller.signal, headers: { 'accept': 'application/json' } },
    );
    if (!res.ok) {
      throw new Error(`CoinGecko error: ${res.status}`);
    }
    const json = (await res.json()) as Record<string, Record<string, number>>;
    const out: Record<string, number | null> = {};
    for (const id of ids) {
      const entry = json[id];
      out[id] = entry && typeof entry[currency] === 'number' ? entry[currency] : null;
    }
    return out;
  } catch (_err) {
    const out: Record<string, number | null> = {};
    for (const id of ids) out[id] = null;
    return out;
  } finally {
    clearTimeout(timer);
  }
}

