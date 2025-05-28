import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export async function getAuditLogs(req: Request, res: Response) {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // limita a los 100 más recientes
    });
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: err.message || 'Error inesperado.' });
  }
}
