import { PrismaClient } from '@prisma/client';
import { expect, test } from 'vitest';

test('prisma can connect to database', async () => {
  const prisma = new PrismaClient();
  try {
    await expect(prisma.$queryRaw`SELECT 1`).resolves.toBeDefined();
  } finally {
    await prisma.$disconnect();
  }
});
