import { Request, Response, NextFunction } from 'express';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ code: 'FORBIDDEN', message: 'Solo un administrador puede realizar esta acción.' });
    return;
  }
  next();
}
