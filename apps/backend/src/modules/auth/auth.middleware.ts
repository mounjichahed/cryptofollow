import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      const err = new Error('Unauthorized') as Error & { status?: number };
      err.status = 401;
      throw err;
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET) as { sub?: string };
    if (!decoded?.sub) {
      const err = new Error('Unauthorized') as Error & { status?: number };
      err.status = 401;
      throw err;
    }

    // attach user id for later use
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).userId = decoded.sub;
    next();
  } catch (err) {
    next(err);
  }
}

