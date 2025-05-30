import { z } from 'zod';

export const eventSchema = z.object({
  title_es: z.string().min(1),
  title_en: z.string().min(1),
  body_es: z.string().min(1),
  body_en: z.string().min(1),
  date: z.string().datetime().or(z.string()),
  tags: z.array(z.string()),
  category: z.string().min(1),
  author: z.string().min(1),
  location_city: z.string().min(1),
  location_country: z.string().min(1),
  coverImageUrl: z.string().url().optional(),
  phrase: z.string().optional(),
  credits: z.string().min(1),
  images: z.array(z.string().url()).optional(),
});