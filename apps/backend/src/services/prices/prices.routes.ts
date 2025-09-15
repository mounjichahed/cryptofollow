import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { getPrices } from './prices.service';

const router = Router();

const querySchema = z.object({
  assets: z
    .string()
    .min(1)
    .transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean)),
  currency: z.enum(['eur', 'usd']).default('eur').transform((c) => c.toUpperCase()),
});

router.get('/', validate({ query: querySchema }), async (req, res, next) => {
  try {
    const { assets, currency } = req.query as unknown as {
      assets: string[];
      currency: 'EUR' | 'USD';
    };
    const data = await getPrices(assets, currency);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;

