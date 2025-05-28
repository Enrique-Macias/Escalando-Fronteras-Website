import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { auditService } from '../services/audit.service';

const prisma = new PrismaClient();

// GET /api/v1/testimonials (lista)
export async function getTestimonialList(req: Request, res: Response) {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(testimonials);
  } catch (err: any) {
    res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: err.message || 'Error inesperado.' });
  }
}

// GET /api/v1/testimonials/:id (detalle)
export async function getTestimonialById(req: Request, res: Response) {
  const id = Number(req.params.id);
  try {
    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });
    if (!testimonial) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Testimonial no encontrado' });
      return;
    }
    res.json(testimonial);
  } catch (err: any) {
    res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: err.message || 'Error inesperado.' });
  }
}

// POST /api/v1/testimonials (crear)
export async function createTestimonial(req: Request, res: Response) {
  const { author, role, body_es, body_en, imageUrl } = req.body;
  try {
    const testimonial = await prisma.testimonial.create({
      data: { author, role, body_es, body_en, imageUrl },
    });
    await auditService.log({
      userId: req.user?.id,
      resource: 'testimonial',
      action: 'create',
      changes: testimonial,
    });
    res.status(201).json(testimonial);
  } catch (err: any) {
    res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: err.message || 'Error inesperado.' });
  }
}

// PUT /api/v1/testimonials/:id (editar)
export async function updateTestimonial(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { author, role, body_es, body_en, imageUrl } = req.body;
  try {
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: { author, role, body_es, body_en, imageUrl },
    });
    await auditService.log({
      userId: req.user?.id,
      resource: 'testimonial',
      action: 'update',
      changes: testimonial,
    });
    res.json(testimonial);
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Testimonial no encontrado.' });
    } else {
      res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: err.message || 'Error inesperado.' });
    }
  }
}

// DELETE /api/v1/testimonials/:id
export async function deleteTestimonial(req: Request, res: Response) {
  const id = Number(req.params.id);
  try {
    await prisma.testimonial.delete({ where: { id } });
    await auditService.log({
      userId: req.user?.id,
      resource: 'testimonial',
      action: 'delete',
      changes: { id },
    });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Testimonial no encontrado.' });
    } else {
      res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: err.message || 'Error inesperado.' });
    }
  }
}
