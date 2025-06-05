import { Request, Response } from 'express';

interface errorMessage {
  status: number;
  message: string;
}

const errorHandler = (err: errorMessage, _req: Request, res: Response) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ success: false, error: message });
};

export default errorHandler;
