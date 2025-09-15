import type { Request, Response, NextFunction } from 'express';
import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from './transactions.service';

export async function listHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId as string;
    const { portfolioId, asset, type, from, to, page = 1, size = 20 } = req.query as any;
    const result = await listTransactions({
      userId,
      portfolioId,
      asset,
      type,
      from,
      to,
      page: Number(page),
      size: Number(size),
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function createHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId as string;
    const created = await createTransaction(userId, req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function updateHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId as string;
    const { id } = req.params;
    const updated = await updateTransaction(userId, id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId as string;
    const { id } = req.params;
    await deleteTransaction(userId, id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

