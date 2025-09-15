import { useMemo, useState } from 'react';
import { useTransactions, useAssets, useDefaultPortfolioId } from '../hooks/useTransactions';
import Table from './Table';
import { useDeleteTransaction } from '../hooks/useTransactions';

function toIso(dtLocal: string | undefined) {
  if (!dtLocal) return undefined;
  const d = new Date(dtLocal);
  return d.toISOString();
}
function qtyFmt(n: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 8 }).format(n);
}
function moneyByCurrency(n: number, currency: string) {
  if (currency === 'EUR' || currency === 'USD') {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n);
  }
  // Fallback for non-ISO currencies like USDT
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(n)} ${currency}`;
}

export default function TransactionsTable() {
  const assetsQuery = useAssets();
  const { data: defaultPid } = useDefaultPortfolioId();
  const del = useDeleteTransaction();
  const [asset, setAsset] = useState<string>('');
  const [type, setType] = useState<'' | 'BUY' | 'SELL'>('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  const query = useTransactions({ portfolioId: defaultPid ?? undefined, asset: asset || undefined, type: type || undefined, from: toIso(from), to: toIso(to), page, size });

  const totalPages = useMemo(() => Math.max(1, Math.ceil((query.data?.total ?? 0) / size)), [query.data?.total, size]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="block text-xs text-gray-500">Actif</label>
          <select
            className="px-2 py-1 border rounded bg-white dark:bg-gray-800"
            value={asset}
            onChange={(e) => { setAsset(e.target.value); setPage(1); }}
          >
            <option value="">Tous</option>
            {(assetsQuery.data ?? []).map((a) => (
              <option key={a.id} value={a.symbol}>{a.symbol}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500">Type</label>
          <select
            className="px-2 py-1 border rounded bg-white dark:bg-gray-800"
            value={type}
            onChange={(e) => { setType(e.target.value as any); setPage(1); }}
          >
            <option value="">Tous</option>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500">De</label>
          <input type="datetime-local" className="px-2 py-1 border rounded bg-white dark:bg-gray-800" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
        </div>
        <div>
          <label className="block text-xs text-gray-500">À</label>
          <input type="datetime-local" className="px-2 py-1 border rounded bg-white dark:bg-gray-800" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700" onClick={() => query.refetch()}>
            Rafraîchir
          </button>
        </div>
      </div>

      <Table
        keyField="id"
        columns={[
          { key: 'tradedAt', header: 'Date', render: (r: any) => new Date(r.tradedAt).toLocaleString() },
          { key: 'asset', header: 'Actif' },
          { key: 'type', header: 'Type' },
          { key: 'quantity', header: 'Quantité', render: (r: any) => qtyFmt(r.quantity) },
          { key: 'price', header: 'Prix unitaire', render: (r: any) => moneyByCurrency(r.price, r.currency) },
          { key: 'fee', header: 'Frais', render: (r: any) => moneyByCurrency(r.fee, r.currency) },
          { key: 'currency', header: 'Devise' },
          { key: 'note', header: 'Note' },
          { key: 'actions', header: '', render: (r: any) => (
            <button
              className="px-2 py-1 rounded bg-red-600 text-white disabled:opacity-50"
              onClick={() => { if (confirm('Supprimer cette transaction ?')) del.mutate(r.id); }}
              disabled={del.isPending}
            >
              Supprimer
            </button>
          ) },
        ]}
        data={query.data?.items ?? []}
      />

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">Page {page} / {totalPages} — {query.data?.total ?? 0} éléments</div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50">Précédent</button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50">Suivant</button>
          <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }} className="px-2 py-1 border rounded bg-white dark:bg-gray-800">
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n}/page</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
