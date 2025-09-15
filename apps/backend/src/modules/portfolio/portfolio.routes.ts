import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware';
import { validate } from '../../middleware/validate';
import { z } from 'zod';
import { getPortfolioSummaryHandler } from './portfolio.controller';

const router = Router();

const querySchema = z.object({
  portfolioId: z.string().cuid().optional(),
});

router.use(requireAuth);
router.get('/', validate({ query: querySchema }), getPortfolioSummaryHandler);

export default router;

