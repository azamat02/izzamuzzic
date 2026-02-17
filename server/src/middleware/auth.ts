import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// @ts-ignore - ESM compat

const JWT_SECRET = process.env.JWT_SECRET || 'izzamuzzic-admin-secret-key-change-in-production';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function signToken(payload: { id: number; username: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}
