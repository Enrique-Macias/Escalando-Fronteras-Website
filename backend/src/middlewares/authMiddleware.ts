import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: number;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Token faltante o inválido' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    // Extrae solo los campos necesarios
    const { id, email, role } = payload as AuthUser;
    req.user = { id, email, role };
    next();
  } catch (err) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Token faltante o inválido' });
    return;
  }
} 