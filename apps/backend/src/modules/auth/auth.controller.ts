import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { loginUser, registerUser } from './auth.service';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await registerUser(email, password);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const token = await loginUser(email, password);
    res.status(200).json(token);
  } catch (err) {
    next(err);
  }
}

