import nodemailer from 'nodemailer';
import { ENV } from '../config/env';

function getTransport() {
  if (!ENV.SMTP_HOST || !ENV.SMTP_PORT || !ENV.SMTP_FROM) return null;
  return nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    secure: !!ENV.SMTP_SECURE,
    auth: ENV.SMTP_USER && ENV.SMTP_PASS ? { user: ENV.SMTP_USER, pass: ENV.SMTP_PASS } : undefined,
  });
}

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  const transport = getTransport();
  if (!transport) {
    // eslint-disable-next-line no-console
    console.warn('[email] SMTP not configured; skipping email to', to);
    return;
  }
  await transport.sendMail({ from: ENV.SMTP_FROM!, to, subject, text, html: html ?? text });
}

