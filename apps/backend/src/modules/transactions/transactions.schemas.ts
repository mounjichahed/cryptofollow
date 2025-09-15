import { z } from 'zod';

export const listQuerySchema = z.object({
  portfolioId: z.string().cuid().optional(),
  asset: z.string().trim().toUpperCase().optional(),
  type: z.enum(['BUY', 'SELL']).optional(),
  from: z.string().datetime().transform((d) => new Date(d)).optional(),
  to: z.string().datetime().transform((d) => new Date(d)).optional(),
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
});

export const createBodySchema = z.object({
  portfolioId: z.string().cuid(),
  asset: z.string().trim().toUpperCase(),
  type: z.enum(['BUY', 'SELL']),
  quantity: z.number().positive(),
  price: z.number().positive(),
  fee: z.number().min(0).default(0),
  currency: z.string().trim().min(1),
  tradedAt: z.string().datetime().transform((d) => new Date(d)),
  note: z.string().optional(),
});

export const updateBodySchema = z.object({
  portfolioId: z.string().cuid(),
  asset: z.string().trim().toUpperCase(),
  type: z.enum(['BUY', 'SELL']),
  quantity: z.number().positive(),
  price: z.number().positive(),
  fee: z.number().min(0).default(0),
  currency: z.string().trim().min(1),
  tradedAt: z.string().datetime().transform((d) => new Date(d)),
  note: z.string().optional(),
});

export type ListQuery = z.infer<typeof listQuerySchema>;
export type CreateBody = z.infer<typeof createBodySchema>;
export type UpdateBody = z.infer<typeof updateBodySchema>;

export const idParamSchema = z.object({ id: z.string().cuid() });
