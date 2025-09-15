import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export type Transaction = {
  id: string;
  portfolioId: string;
  asset: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  fee: number;
  currency: string;
  tradedAt: string;
  note?: string;
};

export type TransactionsResponse = {
  total: number;
  page: number;
  size: number;
  items: Transaction[];
};

export type ListFilters = {
  asset?: string;
  type?: 'BUY' | 'SELL' | '';
  from?: string; // ISO
  to?: string; // ISO
  page?: number;
  size?: number;
};

export function useTransactions(filters: ListFilters) {
  const params = useMemo(() => {
    const p: Record<string, string | number> = {};
    if (filters.asset) p.asset = filters.asset;
    if (filters.type) p.type = filters.type;
    if (filters.from) p.from = filters.from;
    if (filters.to) p.to = filters.to;
    p.page = filters.page ?? 1;
    p.size = filters.size ?? 20;
    return p;
  }, [filters]);

  return useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => (await api.get<TransactionsResponse>('/api/transactions', { params })).data,
    keepPreviousData: true,
  });
}

export type Asset = { id: string; symbol: string; name: string };

export function useAssets() {
  const q = useQuery({
    queryKey: ['assets'],
    queryFn: async () => (await api.get<Asset[]>('/api/assets')).data,
    staleTime: 60_000,
  });
  return q;
}

export function useDefaultPortfolioId() {
  return useQuery({
    queryKey: ['defaultPortfolioId'],
    queryFn: async () => {
      try {
        const res = await api.get<TransactionsResponse>('/api/transactions', { params: { size: 1 } });
        const id = res.data.items[0]?.portfolioId as string | undefined;
        if (id) return id;
      } catch {
        // ignore
      }
      return null as string | null;
    },
    staleTime: 60_000,
  });
}

export type CreateTxInput = {
  portfolioId?: string | null;
  asset: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  fee: number;
  currency: string;
  tradedAt: string; // ISO
  note?: string;
};

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateTxInput) => {
      const { portfolioId, ...rest } = input;
      // backend requires portfolioId; attempt to auto-detect
      let pid = portfolioId ?? null;
      if (!pid) {
        try {
          const res = await api.get<TransactionsResponse>('/api/transactions', { params: { size: 1 } });
          pid = res.data.items[0]?.portfolioId ?? null;
        } catch {
          // ignore
        }
      }
      if (!pid) throw new Error('Aucun portfolio détecté. Veuillez renseigner un portfolioId.');
      const body = { ...rest, portfolioId: pid, asset: rest.asset.toUpperCase() };
      const res = await api.post('/api/transactions', body);
      return res.data;
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['transactions'] }),
        qc.invalidateQueries({ queryKey: ['portfolio'] }),
        qc.invalidateQueries({ queryKey: ['assets'] }),
      ]);
    },
  });
}
