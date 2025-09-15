import type { Request, Response, NextFunction } from 'express';
import { listAssets } from './assets.service';

export async function listAssetsHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await listAssets();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

