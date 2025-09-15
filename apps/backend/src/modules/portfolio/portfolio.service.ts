import prisma from '../../db/client';
import { getPrices } from '../../services/prices/prices.service';
import { ensureUserPortfolio, getPortfolioPositions } from '../transactions/transactions.service';

export type PortfolioPositionView = {
  asset: string; // assetId
  symbol: string;
  quantity: number;
  avgCost: number;
  marketPrice: number | null;
  value: number | null;
  invested: number; // avgCost * quantity
  unrealizedPnl: number | null;
  unrealizedPnlPct: number | null;
  realizedPnl: number; // realized PnL from historical sells
};

export type PortfolioSummary = {
  portfolioId: string;
  baseCurrency: 'EUR' | 'USD';
  totalValue: number;
  totalUnrealizedPnl: number;
  totalRealizedPnl: number;
  totalCost: number;
  positions: PortfolioPositionView[];
};

export async function getPortfolioSummaryService(userId: string, portfolioId?: string) {
  const portfolio = await ensureUserPortfolio(userId, portfolioId);
  const baseCurrency = portfolio.baseCurrency as 'EUR' | 'USD';

  const positionsMap = await getPortfolioPositions(userId, portfolio.id);
  const symbols = Object.keys(positionsMap);

  // Fetch asset ids for symbols
  const assets = await prisma.asset.findMany({
    where: { symbol: { in: symbols } },
    select: { id: true, symbol: true },
  });
  const symbolToId = new Map(assets.map((a) => [a.symbol, a.id] as const));

  // Current prices
  const priceMap = await getPrices(symbols, baseCurrency);

  const positions: PortfolioPositionView[] = [];
  let totalValue = 0;
  let totalUnrealizedPnl = 0;
  let totalRealizedPnl = 0;
  let totalCost = 0;

  for (const sym of symbols) {
    const pos = positionsMap[sym];
    totalRealizedPnl += pos.realizedPnl;
    if (pos.quantityNet <= 0) continue; // skip flat positions for current holdings

    const marketPrice = priceMap[sym] ?? null;
    const value = marketPrice != null ? marketPrice * pos.quantityNet : null;
    const invested = pos.avgCost * pos.quantityNet;
    const unrealizedPnl =
      marketPrice != null ? (marketPrice - pos.avgCost) * pos.quantityNet : null;
    const unrealizedPnlPct =
      marketPrice != null && pos.avgCost > 0
        ? ((marketPrice / pos.avgCost - 1) * 100)
        : null;

    if (value != null) totalValue += value;
    totalCost += invested;
    if (unrealizedPnl != null) totalUnrealizedPnl += unrealizedPnl;

    positions.push({
      asset: symbolToId.get(sym) ?? '',
      symbol: sym,
      quantity: pos.quantityNet,
      avgCost: pos.avgCost,
      marketPrice,
      value,
      invested,
      unrealizedPnl,
      unrealizedPnlPct,
      realizedPnl: pos.realizedPnl,
    });
  }

  const summary: PortfolioSummary = {
    portfolioId: portfolio.id,
    baseCurrency,
    totalValue,
    totalUnrealizedPnl,
    totalRealizedPnl,
    totalCost,
    positions,
  };

  return summary;
}
