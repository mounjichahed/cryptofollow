import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware';
import { getVapidPublicKey, saveSubscription, sendPushToUser } from '../../notifications/push';

const router = Router();

router.get('/vapidPublicKey', (_req, res) => {
  res.json({ publicKey: getVapidPublicKey() });
});

router.post('/subscribe', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).userId as string;
    const sub = req.body as { endpoint: string; keys: { p256dh: string; auth: string } };
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
      return res.status(400).json({ error: 'InvalidSubscription', message: 'Invalid subscription payload' });
    }
    await saveSubscription(userId, sub);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/test', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).userId as string;
    await sendPushToUser(userId, { title: 'Test alerte', body: 'Vos notifications navigateur fonctionnent ✅' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;

