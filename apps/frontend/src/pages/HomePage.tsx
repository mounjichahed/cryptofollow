import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import Table from '../components/Table';
import PieChartCard from '../components/PieChartCard';
import { useState } from 'react';

type PortfolioSummary = {
  portfolioId: string;
  baseCurrency: 'EUR' | 'USD';
  totalValue: number;
  totalUnrealizedPnl: number;
  totalRealizedPnl: number;
  totalCost: number;
  positions: {
    asset: string;
    symbol: string;
    quantity: number;
    avgCost: number;
    marketPrice: number | null;
    value: number | null;
    invested: number;
    unrealizedPnl: number | null;
    unrealizedPnlPct: number | null;
    realizedPnl: number;
  }[];
};

function numberFmt(n: number | null | undefined, opts: Intl.NumberFormatOptions = {}) {
  if (n == null || Number.isNaN(n)) return 'N/A';
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2, ...opts }).format(n);
}
function numberQty(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return 'N/A';
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 8 }).format(n);
}
function moneyFmt(n: number | null | undefined, currency: 'EUR' | 'USD' = 'EUR') {
  if (n == null || Number.isNaN(n)) return 'N/A';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n);
}

export default function HomePage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const query = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => (await api.get<PortfolioSummary>('/api/portfolio')).data,
    refetchInterval: autoRefresh ? 60_000 : false,
  });

  const { data, isLoading, isError, refetch, error } = query;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Portefeuille</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm flex items-center gap-1">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh 60s
          </label>
          <button
            onClick={() => refetch()}
            className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {isLoading && <p>Chargement…</p>}
      {isError && (
        <p className="text-red-600">Erreur: {(error as any)?.message || 'inconnue'}</p>
      )}

      {data && (
        <>
          <header className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <SummaryCard label="Investi" value={moneyFmt(data.totalCost, data.baseCurrency)} />
            <SummaryCard label="Possédé" value={moneyFmt(data.totalValue, data.baseCurrency)} />
            <SummaryCard label="Gain d'investissement" value={moneyFmt(data.totalUnrealizedPnl, data.baseCurrency)} />
            <SummaryCard label="Bénéfice de vente" value={moneyFmt(data.totalRealizedPnl, data.baseCurrency)} />
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Table
                keyField="symbol"
                columns={[
                  { key: 'symbol', header: 'Actif' },
                  { key: 'quantity', header: 'Quantité', render: (r) => numberQty(r.quantity) },
                  { key: 'avgCost', header: 'Prix unitaire (moyen)', render: (r) => moneyFmt(r.avgCost, data.baseCurrency) },
                  {
                    key: 'marketPrice',
                    header: 'Prix actuel (unitaire)',
                    render: (r) => moneyFmt(r.marketPrice ?? null, data.baseCurrency),
                  },
                  { key: 'invested', header: 'Investi', render: (r) => moneyFmt(r.invested, data.baseCurrency) },
                  { key: 'value', header: 'Valeur', render: (r) => moneyFmt(r.value ?? null, data.baseCurrency) },
                  {
                    key: 'unrealizedPnl',
                    header: "Gain d'investissement",
                    render: (r) => moneyFmt(r.unrealizedPnl ?? null, data.baseCurrency),
                  },
                  {
                    key: 'unrealizedPnlPct',
                    header: 'PnL %',
                    render: (r) =>
                      r.unrealizedPnlPct == null
                        ? 'N/A'
                        : `${numberFmt(r.unrealizedPnlPct, { maximumFractionDigits: 2 })}%`,
                  },
                  { key: 'realizedPnl', header: 'Bénéfice de vente', render: (r) => moneyFmt(r.realizedPnl, data.baseCurrency) },
                ]}
                data={data.positions}
              />
            </div>
            <PieChartCard
              title="Répartition par valeur"
              data={data.positions.map((p) => ({ name: p.symbol, value: p.value ?? 0 }))}
            />
          </div>
        </>
      )}
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
