import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export const auditService = {
  async log({ userId, resource, action, changes }: {
    userId?: number,
    resource: string,
    action: string,
    changes: any
  }) {
    await prisma.auditLog.create({
      data: {
        userId,
        resource,
        action,
        changes,
      }
    });
  }
};