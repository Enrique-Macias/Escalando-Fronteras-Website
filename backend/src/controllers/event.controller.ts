import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { auditService } from '../services/audit.service';

const prisma = new PrismaClient();

// GET /api/v1/events (lista sin galería)
export async function getEventList(req: Request, res: Response) {
  try {
    const events = await prisma.event.findMany({
      select: {
        id: true,
        title_es: true,
        title_en: true,
        date: true,
        tags: true,
        category: true,
        author: true,
        location_city: true,
        location_country: true,
        coverImageUrl: true,
        phrase: true,
        credits: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { date: 'desc' },
    });
    res.json(events);
  } catch (err: any) {
    res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: err.message || 'Error inesperado.' });
  }
}

// GET /api/v1/events/:id (detalle + galería)
export async function getEventById(req: Request, res: Response) {
  const id = Number(req.params.id);
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: { eventImages: { orderBy: { order: 'asc' } } },
    });
    if (!event) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Evento no encontrado' });
      return;
    }
    res.json(event);
  } catch (err: any) {
    res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: err.message || 'Error inesperado.' });
  }
}

// POST /api/v1/events (crear)
export async function createEvent(req: Request, res: Response) {
  const {
    title_es, title_en, body_es, body_en, date, tags,
    category, author, location_city, location_country, phrase, credits
  } = req.body;

  // Obtener URLs de Cloudinary desde los archivos subidos
  // @ts-ignore
  const coverImageUrl = req.files?.coverImage?.[0]?.path || '';
  // @ts-ignore
  const images = req.files?.images?.map((file) => file.path) || [];

  try {
    const event = await prisma.event.create({
      data: {
        title_es, title_en, body_es, body_en, date: new Date(date), tags,
        category, author, location_city, location_country, coverImageUrl,
        phrase, credits,
        eventImages: {
          create: images.map((url: string, idx: number) => ({
            imageUrl: url,
            order: idx,
          })),
        },
      },
      include: { eventImages: true },
    });
    await auditService.log({
      userId: req.user?.id,
      resource: 'event',
      action: 'create',
      changes: event,
    });
    res.status(201).json(event);
  } catch (err: any) {
    res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: err.message || 'Error inesperado.' });
  }
}

// PUT /api/v1/events/:id (editar)
export async function updateEvent(req: Request, res: Response) {
  const id = Number(req.params.id);
  const {
    title_es, title_en, body_es, body_en, date, tags,
    category, author, location_city, location_country, phrase, credits
  } = req.body;

  // Obtener URLs de Cloudinary desde los archivos subidos (si hay)
  // @ts-ignore
  const coverImageUrl = req.files?.coverImage?.[0]?.path;
  // @ts-ignore
  const images = req.files?.images?.map((file) => file.path);

  try {
    // Construir el objeto de datos a actualizar
    const updateData: any = {
      title_es, title_en, body_es, body_en, date: new Date(date), tags,
      category, author, location_city, location_country, phrase, credits,
    };
    if (coverImageUrl) updateData.coverImageUrl = coverImageUrl;

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    // Actualizar galería solo si se subieron nuevas imágenes
    if (images && images.length > 0) {
      await prisma.eventImage.deleteMany({ where: { eventId: id } });
      await prisma.eventImage.createMany({
        data: images.map((url: string, idx: number) => ({
          eventId: id,
          imageUrl: url,
          order: idx,
        })),
      });
    }

    const updated = await prisma.event.findUnique({
      where: { id },
      include: { eventImages: { orderBy: { order: 'asc' } } },
    });

    await auditService.log({
      userId: req.user?.id,
      resource: 'event',
      action: 'update',
      changes: updated,
    });
    res.json(updated);
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Evento no encontrado.' });
    } else {
      res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: err.message || 'Error inesperado.' });
    }
  }
}

// DELETE /api/v1/events/:id
export async function deleteEvent(req: Request, res: Response) {
  const id = Number(req.params.id);
  try {
    await prisma.eventImage.deleteMany({ where: { eventId: id } });
    await prisma.event.delete({ where: { id } });
    await auditService.log({
      userId: req.user?.id,
      resource: 'event',
      action: 'delete',
      changes: { id },
    });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Evento no encontrado.' });
    } else {
      res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: err.message || 'Error inesperado.' });
    }
  }
}
