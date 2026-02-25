import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating tpcweb tables safely without dropping existing tpc-ai tables...');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "AdminUser" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Testimonial" (
        "id" TEXT NOT NULL,
        "quote" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "company" TEXT NOT NULL,
        "photoUrl" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SiteSetting" (
        "id" TEXT NOT NULL,
        "key" TEXT NOT NULL,
        "value" JSONB NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Metric" (
        "id" TEXT NOT NULL,
        "key" TEXT NOT NULL,
        "value" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Metric_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Invoice" (
        "id" TEXT NOT NULL,
        "invoiceNumber" TEXT NOT NULL,
        "orderId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "userEmail" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PAID',
        "amount" INTEGER NOT NULL,
        "currency" TEXT NOT NULL DEFAULT 'IDR',
        "plan" TEXT NOT NULL,
        "interval" TEXT NOT NULL DEFAULT 'MONTHLY',
        "paidAt" TIMESTAMP(3),
        "paymentMethod" TEXT,
        "items" JSONB NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
    );
  `);

  // Create indexes safely (ignoring errors if they already exist)
  const indexes = [
    `CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");`,
    `CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");`,
    `CREATE UNIQUE INDEX "Metric_key_key" ON "Metric"("key");`,
    `CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");`,
    `CREATE UNIQUE INDEX "Invoice_orderId_key" ON "Invoice"("orderId");`
  ];

  for (const indexSql of indexes) {
    try {
      await prisma.$executeRawUnsafe(indexSql);
    } catch (e) {
      // Ignore if index already exists
    }
  }

  console.log('✅ Tables created successfully!');
}

main()
  .catch(e => {
    console.error('❌ Error creating tables:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
