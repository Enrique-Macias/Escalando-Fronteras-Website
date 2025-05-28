import { z } from 'zod';

export const userCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(3),
  role: z.enum(['ADMIN', 'EDITOR']),
});

export const userUpdateSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(3),
  role: z.enum(['ADMIN', 'EDITOR']),
});
