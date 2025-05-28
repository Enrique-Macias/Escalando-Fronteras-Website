import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function createUser(req: Request, res: Response) {
  const { email, password, fullName, role } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email, passwordHash, fullName, role },
      select: { id: true, email: true, fullName: true, role: true, createdAt: true }
    });
    res.status(201).json(user);
  } catch (err: any) {
    if (err.code === 'P2002') {
      // Prisma error code for unique constraint violation
      res.status(409).json({ code: 'EMAIL_EXISTS', message: 'El email ya está registrado.' });
    } else {
      res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: 'Error inesperado.' });
    }
  }
}

export async function updateUser(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { email, fullName, role } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { email, fullName, role },
      select: { id: true, email: true, fullName: true, role: true, createdAt: true }
    });
    res.json(user);
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Usuario no encontrado.' });
    } else if (err.code === 'P2002') {
      res.status(409).json({ code: 'EMAIL_EXISTS', message: 'El email ya está registrado.' });
    } else {
      res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: err.message || 'Error inesperado.' });
    }
  }
}

export async function deleteUser(req: Request, res: Response) {
  const id = Number(req.params.id);
  try {
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Usuario no encontrado.' });
    } else {
      res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: err.message || 'Error inesperado.' });
    }
  }
}
