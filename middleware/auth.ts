import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_KEY = process.env.JWT_SECRET || 'SECRET_KEY' ;

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_KEY);
    (req as any).user = payload;
    next();
  } catch (err) {
    throw Object.assign(new Error('Invalid or expired token'), { status: 403 });
  }
};
