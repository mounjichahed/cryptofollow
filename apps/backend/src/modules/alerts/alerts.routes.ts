import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware';
import { validate } from '../../middleware/validate';
import { z } from 'zod';
import prisma from '../../db/client';
import { alertBodySchema, alertUpdateSchema } from './alerts.schemas';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const userId = (req as any).userId as string;
    const items = await prisma.alert.findMany({
      where: { userId },
      select: {
        id: true,
        assetId: true,
        condition: true,
        threshold: true,
        currency: true,
        enabled: true,
        lastTriggeredAt: true,
        createdAt: true,
        asset: { select: { symbol: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.post('/', validate({ body: alertBodySchema }), async (req, res, next) => {
  try {
    const userId = (req as any).userId as string;
    const body = req.body as z.infer<typeof alertBodySchema>;
    const item = await prisma.alert.create({ data: { ...body, userId } });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validate({ body: alertUpdateSchema }), async (req, res, next) => {
  try {
    const userId = (req as any).userId as string;
    const { id } = req.params;
    const body = req.body as z.infer<typeof alertUpdateSchema>;
    const updated = await prisma.alert.update({ where: { id }, data: body });
    if (updated.userId !== userId) return res.status(403).json({ error: 'Forbidden' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const userId = (req as any).userId as string;
    const { id } = req.params;
    const existing = await prisma.alert.findUnique({ where: { id }, select: { userId: true } });
    if (!existing || existing.userId !== userId) return res.status(404).json({ error: 'NotFound' });
    await prisma.alert.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;

