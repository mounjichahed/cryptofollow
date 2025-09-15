import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import errorHandler from './middleware/error';
import authRouter from './modules/auth/auth.routes';
import pricesRouter from './services/prices/prices.routes';
import transactionsRouter from './modules/transactions/transactions.routes';
import portfolioRouter from './modules/portfolio/portfolio.routes';
import assetsRouter from './modules/assets/assets.routes';
import { ENV } from './config/env';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  // CORS: allow configured origins, or wildcard when '*' is set
  const rawOrigins = ENV.CORS_ORIGIN?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];
  const allowAll = rawOrigins.includes('*');
  app.use(
    cors({
      origin: allowAll ? true : (rawOrigins.length > 0 ? rawOrigins : false),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Rate limiting
  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
  const pricesLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });

  app.use('/auth', authLimiter, authRouter);
  app.use('/api/prices', pricesLimiter, pricesRouter);
  app.use('/api/transactions', transactionsRouter);
  app.use('/api/portfolio', portfolioRouter);
  app.use('/api/assets', assetsRouter);

  // Error handler should be last
  app.use(errorHandler);

  return app;
};

export type App = ReturnType<typeof createApp>;
