import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { expect, test } from 'vitest';

import { seedAdmin } from '../../lib/seed-admin';

const ADMIN_EMAIL = 'seed-admin@test.local';
const ADMIN_PASSWORD = 'TestPass123!';

const snapshotEnv = () => ({ ...process.env });

const restoreEnv = (snapshot: NodeJS.ProcessEnv) => {
  for (const key of Object.keys(process.env)) {
    if (!(key in snapshot)) {
      delete process.env[key];
    }
  }
  Object.assign(process.env, snapshot);
};

test('seed admin uses env creds and creates base setting', async () => {
  const prisma = new PrismaClient();
  const envSnapshot = snapshotEnv();
  try {
    Object.assign(process.env, {
      ADMIN_EMAIL,
      ADMIN_PASSWORD,
      NODE_ENV: 'test',
    });
    delete process.env.SEED_RESET_PASSWORD;
    delete process.env.SEED_ALLOW_PROD;

    await prisma.adminUser.deleteMany({ where: { email: ADMIN_EMAIL } });
    await prisma.siteSetting.deleteMany({ where: { key: 'general' } });

    await seedAdmin(prisma);

    const admin = await prisma.adminUser.findFirst({
      where: { email: ADMIN_EMAIL },
    });
    expect(admin).toBeTruthy();
    expect(admin?.passwordHash).toBeTruthy();
    expect(await bcrypt.compare(ADMIN_PASSWORD, admin?.passwordHash ?? '')).toBe(
      true,
    );

    const general = await prisma.siteSetting.findFirst({
      where: { key: 'general' },
    });
    expect(general).toBeTruthy();
  } finally {
    restoreEnv(envSnapshot);
    await prisma.$disconnect();
  }
});

test('seed admin does not overwrite password without reset flag', async () => {
  const prisma = new PrismaClient();
  const envSnapshot = snapshotEnv();
  const originalPassword = 'OriginalPass123!';
  try {
    Object.assign(process.env, {
      ADMIN_EMAIL,
      ADMIN_PASSWORD,
      NODE_ENV: 'test',
    });
    delete process.env.SEED_RESET_PASSWORD;
    delete process.env.SEED_ALLOW_PROD;

    const originalHash = await bcrypt.hash(originalPassword, 10);
    await prisma.adminUser.deleteMany({ where: { email: ADMIN_EMAIL } });
    await prisma.adminUser.create({
      data: { email: ADMIN_EMAIL, passwordHash: originalHash },
    });

    await seedAdmin(prisma);

    const admin = await prisma.adminUser.findFirst({
      where: { email: ADMIN_EMAIL },
    });
    expect(admin?.passwordHash).toBe(originalHash);
  } finally {
    restoreEnv(envSnapshot);
    await prisma.$disconnect();
  }
});

test('seed admin overwrites password when reset flag is true', async () => {
  const prisma = new PrismaClient();
  const envSnapshot = snapshotEnv();
  const originalPassword = 'OriginalPass123!';
  try {
    Object.assign(process.env, {
      ADMIN_EMAIL,
      ADMIN_PASSWORD,
      NODE_ENV: 'test',
      SEED_RESET_PASSWORD: 'true',
    });
    delete process.env.SEED_ALLOW_PROD;

    const originalHash = await bcrypt.hash(originalPassword, 10);
    await prisma.adminUser.deleteMany({ where: { email: ADMIN_EMAIL } });
    await prisma.adminUser.create({
      data: { email: ADMIN_EMAIL, passwordHash: originalHash },
    });

    await seedAdmin(prisma);

    const admin = await prisma.adminUser.findFirst({
      where: { email: ADMIN_EMAIL },
    });
    expect(admin).toBeTruthy();
    expect(admin?.passwordHash).not.toBe(originalHash);
    expect(await bcrypt.compare(ADMIN_PASSWORD, admin?.passwordHash ?? '')).toBe(
      true,
    );
  } finally {
    restoreEnv(envSnapshot);
    await prisma.$disconnect();
  }
});

test('seed admin blocks production without allow flag', async () => {
  const envSnapshot = snapshotEnv();
  try {
    Object.assign(process.env, {
      ADMIN_EMAIL,
      ADMIN_PASSWORD,
      NODE_ENV: 'production',
    });
    delete process.env.SEED_ALLOW_PROD;
    delete process.env.SEED_RESET_PASSWORD;

    await expect(seedAdmin()).rejects.toThrow(
      'Seeding admin is disabled in production without SEED_ALLOW_PROD=true.',
    );
  } finally {
    restoreEnv(envSnapshot);
  }
});
