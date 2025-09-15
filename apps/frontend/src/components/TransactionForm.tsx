import { FormEvent, useMemo, useState } from 'react';
import { useAssets, useCreateTransaction, useDefaultPortfolioId } from '../hooks/useTransactions';

function nowLocal() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function TransactionForm() {
  const assets = useAssets();
  const { data: defaultPid } = useDefaultPortfolioId();
  const mutation = useCreateTransaction();

  const [portfolioId, setPortfolioId] = useState<string>('');
  const [asset, setAsset] = useState<string>('BTC');
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [fee, setFee] = useState<string>('0');
  const [currency, setCurrency] = useState<string>('EUR');
  const [tradedAt, setTradedAt] = useState<string>(nowLocal());
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const resolvedPortfolioId = useMemo(() => portfolioId || defaultPid || null, [portfolioId, defaultPid]);

  function validate(): string | null {
    if (!asset) return 'Actif requis';
    const q = Number(quantity);
    const p = Number(price);
    const f = Number(fee);
    if (!Number.isFinite(q) || q <= 0) return 'Quantité invalide';
    if (!Number.isFinite(p) || p <= 0) return 'Prix invalide';
    if (!Number.isFinite(f) || f < 0) return 'Frais invalide';
    if (!currency) return 'Devise requise';
    if (!tradedAt) return 'Date requise';
    if (!resolvedPortfolioId) return 'Portfolio introuvable. Renseignez un portfolioId.';
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    await mutation.mutateAsync({
      portfolioId: resolvedPortfolioId,
      asset,
      type,
      quantity: Number(quantity),
      price: Number(price),
      fee: Number(fee),
      currency,
      tradedAt: new Date(tradedAt).toISOString(),
      note: note || undefined,
    }).catch((e: any) => setError(e?.response?.data?.message || e?.message || 'Erreur'));
    // keep values but could reset form if desired
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 border border-gray-200 dark:border-gray-800 rounded p-4">
      <h3 className="text-sm font-semibold">Nouvelle transaction</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-500">Portfolio ID (auto si dispo)</label>
          <input className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-800" value={portfolioId} onChange={(e) => setPortfolioId(e.target.value)} placeholder={defaultPid ?? ''} />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Actif</label>
          <select className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-800" value={asset} onChange={(e) => setAsset(e.target.value)}>
            {(assets.data ?? []).map((a) => (
              <option key={a.id} value={a.symbol}>{a.symbol} — {a.name}</option>
            ))}
            {(!assets.data || assets.data.length === 0) && (
              <>
                <option value="BTC">BTC — Bitcoin</option>
                <option value="ETH">ETH — Ethereum</option>
                <option value="SOL">SOL — Solana</option>
              </>
            )}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500">Type</label>
          <select className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-800" value={type} onChange={(e) => setType(e.target.value as 'BUY' | 'SELL')}>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500">Quantité</label>
          <input className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-800" type="number" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Prix</label>
          <input className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-800" type="number" step="any" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Frais</label>
          <input className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-800" type="number" step="any" value={fee} onChange={(e) => setFee(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Devise</label>
          <input className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-800" value={currency} onChange={(e) => setCurrency(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Date</label>
          <input className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-800" type="datetime-local" value={tradedAt} onChange={(e) => setTradedAt(e.target.value)} />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="block text-xs text-gray-500">Note</label>
          <input className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-800" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={mutation.isPending} className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50">
        {mutation.isPending ? 'Création…' : 'Créer'}
      </button>
    </form>
  );
}
