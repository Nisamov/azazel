import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../controllers/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'hikarune-secret-key-change-in-production';

export function auth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string; email: string };
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}