import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { auditService } from '../services/audit.service';
import { translate } from '../services/translation.service';

const prisma = new PrismaClient();

// GET /api/v1/news (lista sin galería)
export async function getNewsList(req: Request, res: Response) {
  try {
    // 1. Leer y normalizar parámetros de paginación y búsqueda
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 50); // máximo 50
    const q = (req.query.q as string)?.trim() || '';
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

    // 2. Construir el filtro (where) dinámico
    const where: any = {};
    if (q) {
      where.OR = [
        { title_es: { contains: q, mode: 'insensitive' } },
        { title_en: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
        { category: { contains: q, mode: 'insensitive' } },
        { author: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }

    // 3. Obtener el total de registros para la paginación
    const totalItems = await prisma.news.count({ where });
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;

    // 4. Obtener los items paginados
    const items = await prisma.news.findMany({
      where,
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
      skip,
      take: limit,
    });

    // 5. Responder con items y metadatos
    res.json({
      items,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
      },
    });
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

// GET /api/v1/news/:id/translation (solo campos en inglés)
export async function getNewsTranslationById(req: Request, res: Response) {
  const id = Number(req.params.id);
  try {
    const news = await prisma.news.findUnique({
      where: { id },
      select: {
        id: true,
        title_en: true,
        body_en: true,
        category_en: true,
        tags_en: true,
        author: true, 
        location_city: true,
        location_country: true,
        // Otros campos en inglés si existen
      },
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
    // Traducción automática si no se envía *_en
    let autoTitleEn = title_en;
    let autoBodyEn = body_en;
    let autoCategoryEn = undefined;
    if (!title_en && title_es) autoTitleEn = await translate(title_es, 'EN');
    if (!body_en && body_es) autoBodyEn = await translate(body_es, 'EN');
    if (category) autoCategoryEn = await translate(category, 'EN');

    let autoTagsEn = undefined;
    if (tags && tags.length > 0) {
      autoTagsEn = await Promise.all(tags.map((tag: string) => translate(tag, 'EN')));
    }

    // Registrar traducción en audit logs
    if (!title_en && title_es) {
      await auditService.log({
        userId: req.user?.id,
        resource: 'news',
        action: 'deepl_translate',
        changes: { field: 'title', original: title_es, translated: autoTitleEn }
      });
    }
    if (!body_en && body_es) {
      await auditService.log({
        userId: req.user?.id,
        resource: 'news',
        action: 'deepl_translate',
        changes: { field: 'body', original: body_es, translated: autoBodyEn }
      });
    }
    if (category) {
      await auditService.log({
        userId: req.user?.id,
        resource: 'news',
        action: 'deepl_translate',
        changes: { field: 'category', original: category, translated: autoCategoryEn }
      });
    }
    if (tags && tags.length > 0) {
      await auditService.log({
        userId: req.user?.id,
        resource: 'news',
        action: 'deepl_translate',
        changes: { field: 'tags', original: tags, translated: autoTagsEn }
      });
    }

    const news = await prisma.news.create({
      data: {
        title_es,
        title_en: autoTitleEn,
        body_es,
        body_en: autoBodyEn,
        category,
        category_en: autoCategoryEn,
        date: new Date(date),
        tags,
        tags_en: autoTagsEn,
        author,
        location_city,
        location_country,
        coverImageUrl,
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
    // Obtener la noticia actual para comparar
    const current = await prisma.news.findUnique({ where: { id } });
    if (!current) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Noticia no encontrada.' });
      return;
    }

    // Traducción automática solo si el campo en español cambió
    let autoTitleEn = title_en;
    let autoBodyEn = body_en;
    let autoCategoryEn = current.category_en;
    let autoTagsEn = current.tags_en;
    if (title_es && title_es !== current.title_es) {
      autoTitleEn = await translate(title_es, 'EN');
      await auditService.log({ userId: req.user?.id, resource: 'news', action: 'deepl_translate', changes: { field: 'title', original: title_es, translated: autoTitleEn } });
    }
    if (body_es && body_es !== current.body_es) {
      autoBodyEn = await translate(body_es, 'EN');
      await auditService.log({ userId: req.user?.id, resource: 'news', action: 'deepl_translate', changes: { field: 'body', original: body_es, translated: autoBodyEn } });
    }
    if (category && category !== current.category) {
      autoCategoryEn = await translate(category, 'EN');
      await auditService.log({ userId: req.user?.id, resource: 'news', action: 'deepl_translate', changes: { field: 'category', original: category, translated: autoCategoryEn } });
    }
    if (tags && JSON.stringify(tags) !== JSON.stringify(current.tags)) {
      autoTagsEn = await Promise.all(tags.map((tag: string) => translate(tag, 'EN')));
      await auditService.log({ userId: req.user?.id, resource: 'news', action: 'deepl_translate', changes: { field: 'tags', original: tags, translated: autoTagsEn } });
    }

    // Construir el objeto de datos a actualizar
    const updateData: any = {
      title_es,
      title_en: autoTitleEn,
      body_es,
      body_en: autoBodyEn,
      tags,
      tags_en: autoTagsEn,
      category,
      category_en: autoCategoryEn,
      author,
      location_city,
      location_country,
    };
    if (coverImageUrl) updateData.coverImageUrl = coverImageUrl;
    if (date !== undefined) {
      updateData.date = new Date(date);
    }

    // Limpia el objeto para quitar los undefined
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

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
