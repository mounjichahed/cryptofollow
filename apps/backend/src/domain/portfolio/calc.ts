import { PortfolioView, Position, TxInput } from './types';

export function computeWeightedAvgCost(
  qOld: number,
  avgOld: number,
  qBuy: number,
  priceBuy: number,
  fee: number = 0,
): number {
  const qNew = qOld + qBuy;
  if (qNew <= 0) return 0;
  const totalCost = qOld * avgOld + qBuy * priceBuy + fee;
  return totalCost / qNew;
}

export function computeSellRealizedPnl(
  priceSell: number,
  avgCost: number,
  qtySell: number,
  fee: number = 0,
): number {
  const gross = (priceSell - avgCost) * qtySell;
  return gross - fee;
}

export function buildPositions(transactions: TxInput[]): PortfolioView {
  const view: PortfolioView = {};

  for (const tx of transactions) {
    const sym = tx.asset.toUpperCase();
    const fee = tx.fee ?? 0;
    const pos: Position = view[sym] ?? { quantityNet: 0, avgCost: 0, realizedPnl: 0 };

    if (tx.type === 'BUY') {
      const newAvg = computeWeightedAvgCost(pos.quantityNet, pos.avgCost, tx.quantity, tx.price, fee);
      pos.quantityNet += tx.quantity;
      pos.avgCost = newAvg;
      // realizedPnl unchanged on buy
    } else if (tx.type === 'SELL') {
      const pnl = computeSellRealizedPnl(tx.price, pos.avgCost, tx.quantity, fee);
      pos.realizedPnl += pnl;
      pos.quantityNet -= tx.quantity;
      if (pos.quantityNet === 0) {
        pos.avgCost = 0; // reset when flat
      }
    }

    view[sym] = pos;
  }

  return view;
}

