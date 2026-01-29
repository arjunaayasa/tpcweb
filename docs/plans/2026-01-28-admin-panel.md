# TPC Admin Panel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a secure admin panel at `/admin-tpc` with login, dashboard stats, testimonial management, and editable site text/settings backed by PostgreSQL.

**Architecture:** Next.js App Router with server routes for auth and CRUD. Prisma connects to PostgreSQL. Admin auth uses hashed password in DB + JWT cookie. UI pages are protected by middleware and server checks.

**Tech Stack:** Next.js 16, React 19, Prisma, PostgreSQL, bcryptjs, jose.

---

### Task 1: Database + Prisma setup

**Files:**
- Create: `prisma/schema.prisma`
- Create: `.env`
- Modify: `package.json`

**Step 1: Write failing test**
Create `tests/db/connection.test.ts`:
```ts
import { PrismaClient } from '@prisma/client';

test('prisma can connect to database', async () => {
  const prisma = new PrismaClient();
  await expect(prisma.$queryRaw`SELECT 1`).resolves.toBeDefined();
  await prisma.$disconnect();
});
```

**Step 2: Run test to verify it fails**
Run: `npm test tests/db/connection.test.ts`
Expected: FAIL (no test runner / no Prisma)

**Step 3: Write minimal implementation**
1) Install dependencies: `npm install prisma @prisma/client bcryptjs jose` and `npm install -D vitest @types/bcryptjs`
2) Create `prisma/schema.prisma`:
```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql" url = env("DATABASE_URL") }

model AdminUser {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Testimonial {
  id        String   @id @default(uuid())
  quote     String
  name      String
  role      String
  company   String
  photoUrl  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model SiteSetting {
  id        String   @id @default(uuid())
  key       String   @unique
  value     Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Metric {
  id        String   @id @default(uuid())
  key       String   @unique
  value     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```
3) Create `.env` with `DATABASE_URL` (from `dbpg.md`) and `ADMIN_JWT_SECRET`.
4) Run `npx prisma migrate dev -n init` and `npx prisma generate`.

**Step 4: Run test to verify it passes**
Run: `npm test tests/db/connection.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add prisma/schema.prisma .env package.json package-lock.json
git commit -m "feat: add prisma postgres schema"
```

---

### Task 2: Seed admin user + base settings

**Files:**
- Create: `scripts/seed-admin.ts`
- Modify: `package.json`

**Step 1: Write failing test**
Create `tests/db/seed-admin.test.ts`:
```ts
import { PrismaClient } from '@prisma/client';

test('admin seed creates user', async () => {
  const prisma = new PrismaClient();
  const admin = await prisma.adminUser.findFirst({ where: { email: 'admin@taxindo.co.id' } });
  expect(admin).toBeTruthy();
  await prisma.$disconnect();
});
```

**Step 2: Run test to verify it fails**
Run: `npm test tests/db/seed-admin.test.ts`
Expected: FAIL (admin not found)

**Step 3: Write minimal implementation**
Create `scripts/seed-admin.ts`:
```ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@taxindo.co.id';
  const password = process.env.ADMIN_PASSWORD || 'Taxindo@1234';
  const hash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: { password: hash },
    create: { email, password: hash },
  });

  await prisma.siteSetting.upsert({
    where: { key: 'general' },
    update: {},
    create: { key: 'general', value: { siteTitle: 'Taxindo Prime Consulting' } },
  });
}

main().finally(() => prisma.$disconnect());
```
Add `"seed:admin": "ts-node scripts/seed-admin.ts"` or `"tsx scripts/seed-admin.ts"` to `package.json`.

**Step 4: Run test to verify it passes**
Run: `npm run seed:admin` then `npm test tests/db/seed-admin.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add scripts/seed-admin.ts package.json
git commit -m "feat: seed admin user"
```

---

### Task 3: Admin auth + middleware protection

**Files:**
- Create: `app/admin-tpc/login/page.tsx`
- Create: `app/admin-tpc/layout.tsx`
- Create: `app/api/admin/login/route.ts`
- Create: `lib/auth.ts`
- Create: `middleware.ts`

**Step 1: Write failing test**
Create `tests/auth/login.test.ts`:
```ts
import { POST } from '@/app/api/admin/login/route';

test('login rejects invalid credentials', async () => {
  const req = new Request('http://localhost/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'bad@taxindo.co.id', password: 'bad' }),
  });

  const res = await POST(req);
  expect(res.status).toBe(401);
});
```

**Step 2: Run test to verify it fails**
Run: `npm test tests/auth/login.test.ts`
Expected: FAIL (route not implemented)

**Step 3: Write minimal implementation**
Implement login route with bcrypt verify + jose JWT cookie (`ADMIN_JWT_SECRET`).
Implement `lib/auth.ts` helpers (sign/verify token).
Add `middleware.ts` to protect `/admin-tpc` and redirect to `/admin-tpc/login` when unauthenticated.

**Step 4: Run test to verify it passes**
Run: `npm test tests/auth/login.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add app/admin-tpc app/api/admin/login lib/auth.ts middleware.ts
git commit -m "feat: add admin login and auth"
```

---

### Task 4: Admin dashboard (stats)

**Files:**
- Create: `app/admin-tpc/page.tsx`
- Create: `app/api/admin/metrics/route.ts`
- Modify: `app/layout.tsx` (inject client-side visit tracking)

**Step 1: Write failing test**
Create `tests/metrics/metrics.test.ts`:
```ts
import { GET } from '@/app/api/admin/metrics/route';

test('metrics returns total visits', async () => {
  const res = await GET();
  expect(res.status).toBe(200);
});
```

**Step 2: Run test to verify it fails**
Run: `npm test tests/metrics/metrics.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**
Create a `Metric` row for `total_visits` and increment it via a lightweight client hook (call `/api/track` once per session). Provide dashboard card showing total visits.

**Step 4: Run test to verify it passes**
Run: `npm test tests/metrics/metrics.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add app/admin-tpc/page.tsx app/api/admin/metrics/route.ts
git commit -m "feat: add admin dashboard metrics"
```

---

### Task 5: Testimonial CRUD

**Files:**
- Create: `app/admin-tpc/testimonials/page.tsx`
- Create: `app/api/admin/testimonials/route.ts`
- Modify: `components/testimonials.tsx` (read from DB via API or server)

**Step 1: Write failing test**
Create `tests/testimonials/crud.test.ts`:
```ts
import { POST } from '@/app/api/admin/testimonials/route';

test('create testimonial', async () => {
  const req = new Request('http://localhost/api/admin/testimonials', {
    method: 'POST',
    body: JSON.stringify({ quote: 'x', name: 'y', role: 'z', company: 'c', photoUrl: '/x.png' }),
  });

  const res = await POST(req);
  expect(res.status).toBe(201);
});
```

**Step 2: Run test to verify it fails**
Run: `npm test tests/testimonials/crud.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**
Implement CRUD routes + admin UI with form and list. Update public testimonials to read DB (server fetch or API call).

**Step 4: Run test to verify it passes**
Run: `npm test tests/testimonials/crud.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add app/admin-tpc/testimonials app/api/admin/testimonials components/testimonials.tsx
git commit -m "feat: manage testimonials in admin"
```

---

### Task 6: General website settings / text editing

**Files:**
- Create: `app/admin-tpc/settings/page.tsx`
- Create: `app/api/admin/settings/route.ts`
- Modify: `components/hero.tsx`, `components/feature-cards.tsx`, `components/feature-details.tsx`, `components/faq.tsx`, `components/footer.tsx`

**Step 1: Write failing test**
Create `tests/settings/settings.test.ts`:
```ts
import { GET } from '@/app/api/admin/settings/route';

test('settings returns general block', async () => {
  const res = await GET();
  expect(res.status).toBe(200);
});
```

**Step 2: Run test to verify it fails**
Run: `npm test tests/settings/settings.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**
Implement settings editor with sections (Hero, Features, FAQ, Footer). Store in `SiteSetting` (key/value JSON). Update public components to read from settings with fallbacks.

**Step 4: Run test to verify it passes**
Run: `npm test tests/settings/settings.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add app/admin-tpc/settings app/api/admin/settings components
git commit -m "feat: editable site text settings"
```

---

### Task 7: Admin navigation + polish

**Files:**
- Modify: `app/admin-tpc/layout.tsx`
- Modify: `app/admin-tpc/page.tsx`

**Step 1: Write failing test**
Create `tests/admin/layout.test.ts`:
```ts
import AdminLayout from '@/app/admin-tpc/layout';

test('admin layout renders navigation', () => {
  expect(AdminLayout).toBeDefined();
});
```

**Step 2: Run test to verify it fails**
Run: `npm test tests/admin/layout.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**
Add sidebar nav items: Dashboard, Testimonials, Settings, Logout. Ensure consistent styling.

**Step 4: Run test to verify it passes**
Run: `npm test tests/admin/layout.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add app/admin-tpc
git commit -m "feat: admin navigation layout"
```

---

## Notes
- Do NOT expose database credentials in UI.
- Admin password can be changed in Settings (update admin user password).
- Create a `/api/admin/logout` route that clears the cookie.
