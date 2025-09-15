import webpush from 'web-push';
import { ENV } from '../config/env';
import prisma from '../db/client';

let configured = false;
function ensureConfigured() {
  if (configured) return;
  if (ENV.VAPID_PUBLIC_KEY && ENV.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(ENV.VAPID_SUBJECT, ENV.VAPID_PUBLIC_KEY, ENV.VAPID_PRIVATE_KEY);
    configured = true;
  }
}

export function getVapidPublicKey() {
  return ENV.VAPID_PUBLIC_KEY || null;
}

export async function saveSubscription(userId: string, sub: { endpoint: string; keys: { p256dh: string; auth: string } }) {
  await prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    update: { userId, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    create: { userId, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
  });
}

export async function sendPushToUser(userId: string, payload: any) {
  ensureConfigured();
  if (!configured) {
    // eslint-disable-next-line no-console
    console.warn('[push] VAPID keys not configured; skipping');
    return;
  }
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  const body = JSON.stringify(payload);
  for (const s of subs) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } } as any, body);
    } catch (e: any) {
      if (e?.statusCode === 410 || e?.statusCode === 404) {
        await prisma.pushSubscription.delete({ where: { endpoint: s.endpoint } }).catch(() => {});
      }
    }
  }
}

