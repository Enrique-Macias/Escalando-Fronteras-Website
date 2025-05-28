import { z } from 'zod';

export const testimonialSchema = z.object({
  author: z.string().min(1),
  role: z.string().min(1),
  body_es: z.string().min(1),
  body_en: z.string().min(1),
  imageUrl: z.string().url(),
});