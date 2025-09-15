import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useState } from 'react';
import Table from '../components/Table';
import { enableWebPush } from '../lib/push';

type Alert = {
  id: string;
  assetId: string;
  condition: 'ABOVE' | 'BELOW';
  threshold: number;
  currency: string;
  enabled: boolean;
  createdAt: string;
  lastTriggeredAt: string | null;
  asset: { symbol: string; name: string };
};

type Asset = { id: string; symbol: string; name: string };

export default function AlertsPage() {
  const qc = useQueryClient();
  const alerts = useQuery({ queryKey: ['alerts'], queryFn: async () => (await api.get<Alert[]>('/api/alerts')).data });
  const assets = useQuery({ queryKey: ['assets'], queryFn: async () => (await api.get<Asset[]>('/api/assets')).data });

  const create = useMutation({
    mutationFn: async (body: { assetId: string; condition: 'ABOVE' | 'BELOW'; threshold: number; currency: string }) =>
      (await api.post('/api/alerts', body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/api/alerts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
  const toggle = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) =>
      (await api.put(`/api/alerts/${id}`, { enabled })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });

  const [assetId, setAssetId] = useState('');
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [threshold, setThreshold] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [msg, setMsg] = useState<string | null>(null);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!assetId || !threshold || !currency) return;
    await create.mutateAsync({ assetId, condition, threshold: Number(threshold), currency }).catch((e: any) => setMsg(e?.message || 'Erreur'));
    setThreshold('');
  }

  async function onEnablePush() {
    const ok = await enableWebPush();
    setMsg(ok ? 'Notifications navigateur activées' : "Impossible d'activer les notifications");
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Alertes prix</h2>
        <button className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700" onClick={onEnablePush}>Activer notifications navigateur</button>
      </header>

      <form onSubmit={onCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 border rounded p-4 border-gray-200 dark:border-gray-800">
        <select className="px-3 py-2 rounded border bg-white dark:bg-gray-800" value={assetId} onChange={(e) => setAssetId(e.target.value)}>
          <option value="">Actif…</option>
          {(assets.data ?? []).map((a) => (
            <option key={a.id} value={a.id}>{a.symbol} — {a.name}</option>
          ))}
        </select>
        <select className="px-3 py-2 rounded border bg-white dark:bg-gray-800" value={condition} onChange={(e) => setCondition(e.target.value as any)}>
          <option value="ABOVE">Au-dessus de</option>
          <option value="BELOW">Au-dessous de</option>
        </select>
        <input className="px-3 py-2 rounded border bg-white dark:bg-gray-800" placeholder="Seuil" type="number" step="any" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
        <select className="px-3 py-2 rounded border bg-white dark:bg-gray-800" value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
        </select>
        <button className="px-3 py-2 rounded bg-blue-600 text-white" type="submit" disabled={create.isPending}>Créer</button>
      </form>

      {msg && <p className="text-sm text-gray-600 dark:text-gray-300">{msg}</p>}

      <Table
        keyField="id"
        columns={[
          { key: 'createdAt', header: 'Créée le', render: (r: Alert) => new Date(r.createdAt).toLocaleString() },
          { key: 'asset', header: 'Actif', render: (r: Alert) => `${r.asset.symbol}` },
          { key: 'condition', header: 'Condition' },
          { key: 'threshold', header: 'Seuil' },
          { key: 'currency', header: 'Devise' },
          { key: 'enabled', header: 'Active', render: (r: Alert) => (
            <input type="checkbox" checked={r.enabled} onChange={(e) => toggle.mutate({ id: r.id, enabled: e.target.checked })} />
          ) },
          { key: 'lastTriggeredAt', header: 'Dernier déclenchement', render: (r: Alert) => r.lastTriggeredAt ? new Date(r.lastTriggeredAt).toLocaleString() : 'Jamais' },
          { key: 'actions', header: '', render: (r: Alert) => (
            <button className="px-2 py-1 rounded bg-red-600 text-white" onClick={() => remove.mutate(r.id)}>Supprimer</button>
          ) },
        ]}
        data={alerts.data ?? []}
      />
    </section>
  );
}

