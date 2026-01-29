import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const requireEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set for admin seeding.`);
  }
  return value;
};

export async function seedAdmin(prisma?: PrismaClient) {
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.SEED_ALLOW_PROD !== 'true'
  ) {
    throw new Error(
      'Seeding admin is disabled in production without SEED_ALLOW_PROD=true.',
    );
  }

  requireEnv('DATABASE_URL');
  const email = requireEnv('ADMIN_EMAIL');
  const password = requireEnv('ADMIN_PASSWORD');

  const client = prisma ?? new PrismaClient();
  const shouldDisconnect = !prisma;

  try {
    await client.$transaction(async (tx) => {
      const existing = await tx.adminUser.findUnique({ where: { email } });

      if (!existing) {
        const passwordHash = await bcrypt.hash(password, 10);
        await tx.adminUser.create({
          data: { email, passwordHash },
        });
      } else if (process.env.SEED_RESET_PASSWORD === 'true') {
        const passwordHash = await bcrypt.hash(password, 10);
        await tx.adminUser.update({
          where: { email },
          data: { passwordHash },
        });
      }

      await tx.siteSetting.upsert({
        where: { key: 'general' },
        update: {},
        create: {
          key: 'general',
          value: { siteTitle: 'Taxindo Prime Consulting' },
        },
      });
    });
  } finally {
    if (shouldDisconnect) {
      await client.$disconnect();
    }
  }
}
