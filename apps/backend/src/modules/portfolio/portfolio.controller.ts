import type { Request, Response, NextFunction } from 'express';
import { getPortfolioSummaryService } from './portfolio.service';

export async function getPortfolioSummaryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId as string;
    const { portfolioId } = req.query as { portfolioId?: string };
    const data = await getPortfolioSummaryService(userId, portfolioId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

