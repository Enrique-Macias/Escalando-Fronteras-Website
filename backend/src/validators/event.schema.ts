import { z } from 'zod';

export const eventSchema = z.object({
  title_es: z.string().min(1),
  title_en: z.string().min(1).optional(),
  body_es: z.string().min(1),
  body_en: z.string().min(1).optional(),
  date: z.string().datetime().or(z.string()),
  tags: z.array(z.string()),
  tags_en: z.array(z.string()).optional(),
  category: z.string().min(1),
  category_en: z.string().min(1).optional(),
  author: z.string().min(1),
  location_city: z.string().min(1),
  location_country: z.string().min(1),
  coverImageUrl: z.string().url().optional(),
  phrase: z.string().optional(),
  phrase_en: z.string().optional(),
  credits: z.string().min(1),
  credits_en: z.string().optional(),
  images: z.array(z.string().url()).optional(),
});

// Esquema para edición (todos los campos opcionales)
export const eventUpdateSchema = z.object({
  title_es: z.string().min(1).optional(),
  title_en: z.string().min(1).optional(),
  body_es: z.string().min(1).optional(),
  body_en: z.string().min(1).optional(),
  date: z.string().datetime().or(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  tags_en: z.array(z.string()).optional(),
  category: z.string().min(1).optional(),
  category_en: z.string().min(1).optional(),
  author: z.string().min(1).optional(),
  location_city: z.string().min(1).optional(),
  location_country: z.string().min(1).optional(),
  coverImageUrl: z.string().url().optional(),
  phrase: z.string().optional(),
  phrase_en: z.string().optional(),
  credits: z.string().min(1).optional(),
  credits_en: z.string().optional(),
  images: z.array(z.string().url()).optional(),
});