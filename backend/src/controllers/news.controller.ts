import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { auditService } from '../services/audit.service';

const prisma = new PrismaClient();

// GET /api/v1/news (lista sin galería)
export async function getNewsList(req: Request, res: Response) {
  try {
    const news = await prisma.news.findMany({
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
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { date: 'desc' },
    });
    res.json(news);
  } catch (err: any) {
    res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: err.message || 'Error inesperado.' });
  }
}

// GET /api/v1/news/:id (detalle + galería)
export async function getNewsById(req: Request, res: Response) {
  const id = Number(req.params.id);
  try {
    const news = await prisma.news.findUnique({
      where: { id },
      include: { newsImages: { orderBy: { order: 'asc' } } },
    });
    if (!news) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Noticia no encontrada' });
      return;
    }
    res.json(news);
  } catch (err: any) {
    res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: err.message || 'Error inesperado.' });
  }
}

// POST /api/v1/news (crear)
export async function createNews(req: Request, res: Response) {
  const {
    title_es, title_en, body_es, body_en, date, tags,
    category, author, location_city, location_country
  } = req.body;

  // Obtener URLs de Cloudinary desde los archivos subidos
  // @ts-ignore
  const coverImageUrl = req.files?.coverImage?.[0]?.path || '';
  // @ts-ignore
  const images = req.files?.images?.map((file) => file.path) || [];

  try {
    const news = await prisma.news.create({
      data: {
        title_es, title_en, body_es, body_en, date: new Date(date), tags,
        category, author, location_city, location_country, coverImageUrl,
        newsImages: {
          create: images.map((url: string, idx: number) => ({
            imageUrl: url,
            order: idx,
          })),
        },
      },
      include: { newsImages: true },
    });
    await auditService.log({
      userId: req.user?.id,
      resource: 'news',
      action: 'create',
      changes: news,
    });
    res.status(201).json(news);
  } catch (err: any) {
    res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: err.message || 'Error inesperado.' });
  }
}

// PUT /api/v1/news/:id (editar)
export async function updateNews(req: Request, res: Response) {
  const id = Number(req.params.id);
  const {
    title_es, title_en, body_es, body_en, date, tags,
    category, author, location_city, location_country
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
      category, author, location_city, location_country,
    };
    if (coverImageUrl) updateData.coverImageUrl = coverImageUrl;

    const news = await prisma.news.update({
      where: { id },
      data: updateData,
    });

    // Actualizar galería solo si se subieron nuevas imágenes
    if (images && images.length > 0) {
      await prisma.newsImage.deleteMany({ where: { newsId: id } });
      await prisma.newsImage.createMany({
        data: images.map((url: string, idx: number) => ({
          newsId: id,
          imageUrl: url,
          order: idx,
        })),
      });
    }

    const updated = await prisma.news.findUnique({
      where: { id },
      include: { newsImages: { orderBy: { order: 'asc' } } },
    });

    await auditService.log({
      userId: req.user?.id,
      resource: 'news',
      action: 'update',
      changes: updated,
    });
    res.json(updated);
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Noticia no encontrada.' });
    } else {
      res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: err.message || 'Error inesperado.' });
    }
  }
}

// DELETE /api/v1/news/:id
export async function deleteNews(req: Request, res: Response) {
  const id = Number(req.params.id);
  try {
    await prisma.newsImage.deleteMany({ where: { newsId: id } });
    await prisma.news.delete({ where: { id } });
    await auditService.log({
      userId: req.user?.id,
      resource: 'news',
      action: 'delete',
      changes: { id },
    });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Noticia no encontrada.' });
    } else {
      res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: err.message || 'Error inesperado.' });
    }
  }
}
