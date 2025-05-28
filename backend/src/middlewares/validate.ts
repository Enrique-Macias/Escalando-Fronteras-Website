import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validateBody(schema: ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        code: 'INVALID_PAYLOAD',
        message: 'Payload inválido',
        errors: result.error.errors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
