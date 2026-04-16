import { Request, Response, NextFunction } from 'express';
import { loginSchema } from '../schemas/auth.schema';
import { login } from '../services/auth.service';

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await login(data);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
