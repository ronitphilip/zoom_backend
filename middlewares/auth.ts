import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_KEY = process.env.JWT_SECRET || 'SECRET_KEY';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_KEY) as { userId: number; role: string };
    req.user = payload;
    next();
  } catch {
    throw Object.assign(new Error('Invalid or expired token'), { status: 403 });
  }
};

export const verifyAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log("verifyAdmin");

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw Object.assign(new Error('Token not found!'), { status: 409 });
  }
  const token = authHeader.split(' ')[1];
  try {
    const verified = jwt.verify(token, JWT_KEY) as { userId: number; role: string };

    if (verified.role !== "admin") throw Object.assign(new Error('Unauthorized'), { status: 401 });

    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json(err);
  }
};
