import prisma from '../../db/client';
import { buildPositions } from '../../domain/portfolio/calc';
import type { TxInput } from '../../domain/portfolio/types';

type ListFilters = {
  userId: string;
  portfolioId?: string;
  asset?: string;
  type?: 'BUY' | 'SELL';
  from?: Date;
  to?: Date;
  page: number;
  size: number;
};

export async function ensureUserPortfolio(userId: string, portfolioId?: string) {
  if (portfolioId) {
    const p = await prisma.portfolio.findFirst({ where: { id: portfolioId, userId } });
    if (!p) {
      const err = new Error('Portfolio not found') as Error & { status?: number };
      err.status = 404;
      throw err;
    }
    return p;
  }
  const p = await prisma.portfolio.findFirst({ where: { userId }, orderBy: { createdAt: 'asc' } });
  if (!p) {
    const err = new Error('No portfolio for user') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  return p;
}

export async function listTransactions(filters: ListFilters) {
  const portfolio = await ensureUserPortfolio(filters.userId, filters.portfolioId);

  const where: Parameters<typeof prisma.transaction.findMany>[0]['where'] = {
    portfolioId: portfolio.id,
  };
  if (filters.asset) where.asset = { symbol: filters.asset.toUpperCase() };
  if (filters.type) where.type = filters.type;
  if (filters.from || filters.to) {
    where.tradedAt = {};
    if (filters.from) where.tradedAt.gte = filters.from;
    if (filters.to) where.tradedAt.lte = filters.to;
  }

  const skip = (filters.page - 1) * filters.size;
  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { asset: { select: { symbol: true, name: true } } },
      orderBy: { tradedAt: 'desc' },
      skip,
      take: filters.size,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    total,
    page: filters.page,
    size: filters.size,
    items: items.map((t) => ({
      id: t.id,
      portfolioId: t.portfolioId,
      asset: t.asset.symbol,
      type: t.type,
      quantity: Number(t.quantity),
      price: Number(t.price),
      fee: Number(t.fee),
      currency: t.currency,
      tradedAt: t.tradedAt,
      note: t.note ?? undefined,
    })),
  };
}

async function getAssetBySymbol(symbol: string) {
  const asset = await prisma.asset.findUnique({ where: { symbol: symbol.toUpperCase() } });
  if (!asset) {
    const err = new Error('Asset not found') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  return asset;
}

async function assertSellNotExceeding(
  portfolioId: string,
  assetSymbol: string,
  candidate: { type: 'BUY' | 'SELL'; quantity: number },
  excludeTxId?: string,
) {
  if (candidate.type !== 'SELL') return;
  const existing = await prisma.transaction.findMany({
    where: {
      portfolioId,
      asset: { symbol: assetSymbol.toUpperCase() },
      ...(excludeTxId ? { id: { not: excludeTxId } } : {}),
    },
    orderBy: { tradedAt: 'asc' },
    include: { asset: { select: { symbol: true } } },
  });

  const txInputs: TxInput[] = existing.map((t) => ({
    asset: t.asset.symbol,
    type: t.type as 'BUY' | 'SELL',
    quantity: Number(t.quantity),
    price: Number(t.price),
    fee: Number(t.fee),
  }));
  const positions = buildPositions(txInputs);
  const pos = positions[assetSymbol.toUpperCase()] ?? { quantityNet: 0, avgCost: 0, realizedPnl: 0 };

  if (candidate.quantity > pos.quantityNet) {
    const err = new Error('Sell quantity exceeds available position') as Error & { status?: number };
    err.status = 400;
    throw err;
  }
}

export async function createTransaction(userId: string, data: {
  portfolioId: string;
  asset: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  fee: number;
  currency: string;
  tradedAt: Date;
  note?: string;
}) {
  const portfolio = await ensureUserPortfolio(userId, data.portfolioId);
  await assertSellNotExceeding(portfolio.id, data.asset, { type: data.type, quantity: data.quantity });
  const asset = await getAssetBySymbol(data.asset);

  const created = await prisma.transaction.create({
    data: {
      portfolioId: portfolio.id,
      assetId: asset.id,
      type: data.type,
      quantity: data.quantity,
      price: data.price,
      fee: data.fee,
      currency: data.currency,
      tradedAt: data.tradedAt,
      note: data.note,
    },
  });
  return created;
}

export async function updateTransaction(userId: string, id: string, data: {
  portfolioId: string;
  asset: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  fee: number;
  currency: string;
  tradedAt: Date;
  note?: string;
}) {
  const existing = await prisma.transaction.findUnique({ include: { portfolio: true, asset: true }, where: { id } });
  if (!existing || existing.portfolio.userId !== userId) {
    const err = new Error('Transaction not found') as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  // Ensure target portfolio belongs to user
  const portfolio = await ensureUserPortfolio(userId, data.portfolioId);

  await assertSellNotExceeding(portfolio.id, data.asset, { type: data.type, quantity: data.quantity }, id);
  const asset = await getAssetBySymbol(data.asset);

  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      portfolioId: portfolio.id,
      assetId: asset.id,
      type: data.type,
      quantity: data.quantity,
      price: data.price,
      fee: data.fee,
      currency: data.currency,
      tradedAt: data.tradedAt,
      note: data.note,
    },
  });
  return updated;
}

export async function deleteTransaction(userId: string, id: string) {
  const existing = await prisma.transaction.findUnique({ include: { portfolio: true }, where: { id } });
  if (!existing || existing.portfolio.userId !== userId) {
    const err = new Error('Transaction not found') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  await prisma.transaction.delete({ where: { id } });
}

export async function getPortfolioPositions(userId: string, portfolioId?: string) {
  const portfolio = await ensureUserPortfolio(userId, portfolioId);
  const txs = await prisma.transaction.findMany({
    where: { portfolioId: portfolio.id },
    orderBy: { tradedAt: 'asc' },
    include: { asset: { select: { symbol: true } } },
  });

  const inputs: TxInput[] = txs.map((t) => ({
    asset: t.asset.symbol,
    type: t.type as 'BUY' | 'SELL',
    quantity: Number(t.quantity),
    price: Number(t.price),
    fee: Number(t.fee),
  }));

  return buildPositions(inputs);
}

