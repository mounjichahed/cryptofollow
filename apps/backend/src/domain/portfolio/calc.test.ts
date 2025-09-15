import { buildPositions, computeSellRealizedPnl, computeWeightedAvgCost } from './calc';
import type { TxInput } from './types';

describe('computeWeightedAvgCost', () => {
  test('buy from zero without fee', () => {
    const avg = computeWeightedAvgCost(0, 0, 2, 100, 0);
    expect(avg).toBe(100);
  });

  test('buy from zero with fee', () => {
    const avg = computeWeightedAvgCost(0, 0, 2, 100, 10);
    expect(avg).toBe(105);
  });

  test('weighted average with existing position and fee', () => {
    const avg = computeWeightedAvgCost(2, 100, 3, 120, 5);
    expect(avg).toBeCloseTo(113, 6);
  });
});

describe('computeSellRealizedPnl', () => {
  test('sell with fee', () => {
    const pnl = computeSellRealizedPnl(130, 100, 1, 2);
    expect(pnl).toBe(28);
  });
});

describe('buildPositions', () => {
  test('buy, buy with fee, sell with fee -> remaining qty and realized pnl', () => {
    const txs: TxInput[] = [
      { asset: 'BTC', type: 'BUY', quantity: 2, price: 100, fee: 0 },
      { asset: 'BTC', type: 'BUY', quantity: 3, price: 120, fee: 5 },
      { asset: 'BTC', type: 'SELL', quantity: 4, price: 110, fee: 1 },
    ];
    const pos = buildPositions(txs)['BTC'];
    expect(pos.quantityNet).toBe(1);
    expect(pos.avgCost).toBeCloseTo(113, 6);
    expect(pos.realizedPnl).toBeCloseTo(-13, 6);
  });

  test('reset avg cost when position goes to zero', () => {
    const txs: TxInput[] = [
      { asset: 'ETH', type: 'BUY', quantity: 1, price: 200, fee: 0 },
      { asset: 'ETH', type: 'SELL', quantity: 1, price: 200, fee: 0 },
    ];
    const pos = buildPositions(txs)['ETH'];
    expect(pos.quantityNet).toBe(0);
    expect(pos.avgCost).toBe(0);
    expect(pos.realizedPnl).toBe(0);
  });

  test('oversell results in negative position and keeps avgCost', () => {
    const txs: TxInput[] = [
      { asset: 'SOL', type: 'BUY', quantity: 1, price: 100, fee: 0 },
      { asset: 'SOL', type: 'SELL', quantity: 2, price: 120, fee: 0 },
    ];
    const pos = buildPositions(txs)['SOL'];
    expect(pos.quantityNet).toBe(-1);
    // avg cost remains same since not flat
    expect(pos.avgCost).toBe(100);
    // realized pnl computed on sold qty
    expect(pos.realizedPnl).toBe((120 - 100) * 2);
  });
});
