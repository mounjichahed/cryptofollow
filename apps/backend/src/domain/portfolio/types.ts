export type Position = {
  quantityNet: number;
  avgCost: number; // average cost per unit in quote currency
  realizedPnl: number; // cumulative realized PnL in quote currency
};

export type PortfolioView = Record<string, Position>; // key: asset symbol (e.g., BTC)

export type TxType = 'BUY' | 'SELL';

export type TxInput = {
  asset: string; // symbol like BTC
  type: TxType;
  quantity: number; // positive
  price: number; // unit price
  fee?: number; // total fee in same currency as price
};

