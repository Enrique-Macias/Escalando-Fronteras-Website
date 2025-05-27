import csurf from 'csurf';
import { Request, Response, NextFunction } from 'express';

// Middleware CSRF usando cookies
export const csrfProtection = csurf({ cookie: true });

// Middleware para enviar el token CSRF en el header x-csrf-token
export function sendCsrfToken(req: Request, res: Response, next: NextFunction) {
  res.setHeader('x-csrf-token', req.csrfToken());
  next();
} 