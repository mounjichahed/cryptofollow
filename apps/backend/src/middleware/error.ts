import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

type KnownError = Error & { status?: number; statusCode?: number; code?: string };

const isZodError = (err: unknown): err is ZodError => err instanceof ZodError;

const getStatusCode = (err: KnownError) => err.statusCode ?? err.status ?? 500;

export default function errorHandler(
  err: KnownError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (isZodError(err)) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Invalid request data',
      issues: err.issues.map((i) => ({ path: i.path, message: i.message, code: i.code })),
    });
  }

  const status = getStatusCode(err);
  const payload: Record<string, unknown> = {
    error: err.name || 'Error',
    message: err.message || 'Internal Server Error',
  };

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
    if (err.code) payload.code = err.code;
  }

  return res.status(status).json(payload);
}

