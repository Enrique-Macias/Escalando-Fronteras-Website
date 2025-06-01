import { z } from 'zod';

export const newsSchema = z.object({
  title_es: z.string().min(1),
  title_en: z.string().min(1).optional(),
  body_es: z.string().min(1),
  body_en: z.string().min(1).optional(),
  date: z.string().datetime().or(z.string()), // acepta string ISO
  tags: z.array(z.string()),
  category: z.string().min(1),
  author: z.string().min(1),
  location_city: z.string().min(1),
  location_country: z.string().min(1),
  coverImageUrl: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
});

// Nuevo esquema para edición
export const newsUpdateSchema = z.object({
  title_es: z.string().min(1).optional(),
  title_en: z.string().min(1).optional(),
  body_es: z.string().min(1).optional(),
  body_en: z.string().min(1).optional(),
  date: z.string().datetime().or(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().min(1).optional(),
  author: z.string().min(1).optional(),
  location_city: z.string().min(1).optional(),
  location_country: z.string().min(1).optional(),
  coverImageUrl: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
});