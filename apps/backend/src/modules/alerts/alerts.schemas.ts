import { z } from 'zod';

export const alertBodySchema = z.object({
  assetId: z.string().cuid(),
  condition: z.enum(['ABOVE', 'BELOW']),
  threshold: z.number().positive(),
  currency: z.string().min(1),
  enabled: z.boolean().optional().default(true),
});

export const alertUpdateSchema = alertBodySchema.partial();

