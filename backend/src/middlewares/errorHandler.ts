import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: err.message || 'Internal server error'
  });
} 