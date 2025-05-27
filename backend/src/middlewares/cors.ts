import { Request, Response, NextFunction } from 'express';

export const customCors = (req: Request, res: Response, next: NextFunction): void => {
  const allowedOrigin = process.env.FRONTEND_URL;
  const origin = req.headers.origin;

  console.log('Origin header:', origin);
  console.log('Allowed origin:', allowedOrigin);

  const cleanOrigin = origin?.replace(/\/$/, '').trim();
  const cleanAllowed = allowedOrigin?.replace(/\/$/, '').trim();

  if (cleanOrigin && cleanAllowed && cleanOrigin === cleanAllowed) {
    res.header('Access-Control-Allow-Origin', allowedOrigin!);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
    return;
  } else if (origin) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  } else {
    // No origin header (e.g., curl, server-to-server), allow
    next();
    return;
  }
}; 