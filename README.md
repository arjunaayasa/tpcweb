# TPC Web — Taxindo Prime Consulting Client Portal

Portal web klien untuk **Taxindo Prime Consulting** yang terhubung dengan platform TPC-AI. Dibangun menggunakan **Next.js 16**, **Prisma**, dan **Tailwind CSS 4**.

---

## Daftar Isi

- [Arsitektur](#arsitektur)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Setup Database](#setup-database)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Build & Deploy](#build--deploy)
- [Struktur Proyek](#struktur-proyek)
- [Fitur Utama](#fitur-utama)
- [Integrasi SSO dengan TPC-AI](#integrasi-sso-dengan-tpc-ai)
- [Dokumentasi API](#dokumentasi-api)

---

## Arsitektur

```
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   TPC Web        │      │   TPC-AI         │      │   Auth Center    │
│   (Client Portal)│─────>│   (AI Chat App)  │─────>│   (Backend Auth) │
│   Next.js        │ SSO  │   Next.js        │      │   REST API       │
│   Port: 3000     │      │   Port: 3000     │      │                  │
└──────┬───────────┘      └──────────────────┘      └──────────────────┘
       │
       ▼
┌──────────────────┐
│   PostgreSQL     │
│   (Billing DB)   │
└──────────────────┘
```

- **TPC Web** (repo ini): Client portal (landing page, profil, billing, invoice, admin panel)
- **TPC-AI**: Aplikasi AI Chat & Tax Knowledge (repo terpisah, laptop/server terpisah)
- **Auth Center**: Backend autentikasi (repo terpisah, berjalan di TPC-AI)

---

## Prasyarat

| Software   | Versi Minimum | Catatan                         |
|------------|---------------|---------------------------------|
| Node.js    | 18.x          | Disarankan LTS (20.x atau 22.x)|
| npm        | 9.x           | Bundled dengan Node.js          |
| PostgreSQL | 14.x          | Bisa lokal atau remote          |
| Git        | 2.x           | Version control                 |

---

## Instalasi

### 1. Clone Repositori

```bash
git clone <repository-url> tpcweb
cd tpcweb
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Salin File Environment

```bash
cp .env.example .env
```

> Jika belum ada `.env.example`, buat file `.env` secara manual. Lihat bagian [Konfigurasi Environment](#konfigurasi-environment).

---

## Konfigurasi Environment

Buat file `.env` di root proyek dengan variabel berikut:

```env
# ═══════════════════════════════════════════════
# DATABASE
# ═══════════════════════════════════════════════
DATABASE_URL=postgres://user:password@host:5432/dbname

# ═══════════════════════════════════════════════
# ADMIN PANEL
# ═══════════════════════════════════════════════
ADMIN_JWT_SECRET=<random-hex-string-64-chars>
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=YourAdminPassword123

# ═══════════════════════════════════════════════
# BILLING & PAYMENT (Midtrans)
# ═══════════════════════════════════════════════
BILLING_API_KEY=<api-key-for-billing>
MIDTRANS_SERVER_KEY=<midtrans-server-key>
MIDTRANS_CLIENT_KEY=<midtrans-client-key>
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=<midtrans-client-key>
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false

# ═══════════════════════════════════════════════
# AUTH / SSO — Koneksi ke TPC-AI
# ═══════════════════════════════════════════════
AUTH_BASE_URL=http://<tpc-ai-host>:3000
NEXT_PUBLIC_TPCAI_URL=http://<tpc-ai-host>:3000
```

### Penjelasan Variabel

| Variabel | Deskripsi |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL untuk database billing/invoice |
| `ADMIN_JWT_SECRET` | Secret key untuk JWT admin panel (min. 32 chars) |
| `ADMIN_EMAIL` | Email default admin (digunakan saat seed) |
| `ADMIN_PASSWORD` | Password default admin (digunakan saat seed) |
| `BILLING_API_KEY` | API key untuk verifikasi billing antar service |
| `MIDTRANS_SERVER_KEY` | Server key Midtrans (sandbox/production) |
| `MIDTRANS_CLIENT_KEY` | Client key Midtrans (sandbox/production) |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Sama dengan `MIDTRANS_CLIENT_KEY` (untuk client-side) |
| `MIDTRANS_IS_PRODUCTION` | `true` untuk production, `false` untuk sandbox |
| `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION` | Sama dengan `MIDTRANS_IS_PRODUCTION` (client-side) |
| `AUTH_BASE_URL` | URL lengkap TPC-AI backend (server-side proxy) |
| `NEXT_PUBLIC_TPCAI_URL` | URL TPC-AI yang bisa diakses dari browser (SSO redirect) |

> **Penting:** `AUTH_BASE_URL` dan `NEXT_PUBLIC_TPCAI_URL` biasanya sama. Keduanya mengarah ke server TPC-AI tempat Auth Center berjalan.

---

## Setup Database

### 1. Buat Database PostgreSQL

```sql
CREATE DATABASE tpcweb;
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Jalankan Migrasi

```bash
npx prisma migrate deploy
```

> Untuk development, gunakan `npx prisma migrate dev` agar migrasi baru bisa dibuat.

### 4. Seed Data Admin

```bash
npm run seed:admin
```

Perintah ini membuat user admin dengan email dan password dari `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

---

## Menjalankan Aplikasi

### Development

```bash
npm run dev
```

Akses di [http://localhost:3000](http://localhost:3000).

Untuk akses dari perangkat lain dalam jaringan lokal:

```bash
npm run dev -- --hostname 0.0.0.0
```

Akses via `http://<ip-address>:3000` dari perangkat lain.

### Script Tersedia

| Script            | Perintah              | Keterangan                      |
|-------------------|-----------------------|---------------------------------|
| Development       | `npm run dev`         | Hot reload, mode development    |
| Build             | `npm run build`       | Build production bundle         |
| Start             | `npm run start`       | Jalankan production build       |
| Lint              | `npm run lint`        | Cek kode dengan ESLint          |
| Test              | `npm run test`        | Jalankan test dengan Vitest     |
| Seed Admin        | `npm run seed:admin`  | Buat user admin di database     |

---

## Build & Deploy

### Build Production

```bash
npm run build
npm run start
```

### Deploy dengan Docker (Opsional)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
```

> Pastikan `output: 'standalone'` ditambahkan di `next.config.ts` untuk Docker deployment.

---

## Struktur Proyek

```
tpcweb/
├── app/                    # Next.js App Router
│   ├── admin-tpc/          # Admin panel (settings, users, invoices)
│   ├── api/                # API routes (auth, billing, payment)
│   ├── invoice/            # Halaman invoice publik
│   ├── login/              # Halaman login
│   ├── register/           # Halaman registrasi
│   ├── my-profile/         # Client portal (profil, langganan, dll)
│   ├── payment/            # Halaman pembayaran (Midtrans)
│   ├── pricing/            # Halaman harga
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/             # Komponen UI reusable
│   ├── hero.tsx            # Hero section dengan chat/search
│   ├── navbar.tsx          # Navigation bar (server component)
│   ├── navbar-client.tsx   # Navigation bar (client component)
│   └── ...
├── lib/                    # Utility & helper functions
│   ├── sso.ts              # SSO auth helper (cookie, Bearer token)
│   ├── auth.ts             # Admin JWT authentication
│   ├── site-settings.ts    # Dynamic site settings from DB
│   ├── use-sso-token.ts    # Client-side SSO token hook
│   └── ...
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # SQL migrations
├── scripts/
│   └── seed-admin.ts       # Admin seeder script
├── docs/
│   └── api/                # API documentation
│       ├── AUTH_API.md      # Auth API docs
│       └── auth-openapi.json
├── tests/                  # Test files (Vitest)
├── middleware.ts            # Next.js middleware (auth guard)
├── next.config.ts           # Next.js config (CORS, dll)
├── .env                     # Environment variables
└── package.json
```

---

## Fitur Utama

### Landing Page
- Hero section dengan chat AI dan pencarian regulasi
- Daftar produk & pricing
- Testimoni (dikelola via admin panel)
- FAQ section

### Client Portal (`/my-profile`)
- Dashboard profil pengguna
- Statistik penggunaan AI
- Akses cepat ke Owlie Chat & Tax Knowledge (via SSO)
- Manajemen langganan

### Pembayaran
- Integrasi Midtrans Snap
- Halaman pricing interaktif
- Invoice otomatis setelah pembayaran

### Admin Panel (`/admin-tpc`)
- Manajemen pengguna & langganan
- Pengaturan situs (hero, redirect URLs, dll)
- Manajemen testimoni
- Dashboard system metrics
- Pengaturan invoice

---

## Integrasi SSO dengan TPC-AI

Aplikasi ini terintegrasi dengan TPC-AI menggunakan mekanisme SSO. Setelah user login, `sessionToken` disimpan di `localStorage` dan digunakan saat membuka link TPC-AI.

### Alur SSO

```
1. User login di TPC Web → dapat sessionToken
2. Klik "Owlie Chat" → buka TPC-AI/chat?sso_token=XXX
3. TPC-AI middleware detect sso_token → redirect ke SSO bridge
4. SSO bridge set cookie tpc_session → redirect balik ke /chat
5. User sudah login di TPC-AI ✓
```

### Endpoint Auth Proxy

| Endpoint              | Method | Deskripsi                        |
|-----------------------|--------|----------------------------------|
| `/api/auth/login`     | POST   | Proxy login ke Auth Center       |
| `/api/auth/register`  | POST   | Proxy registrasi ke Auth Center  |
| `/api/auth/logout`    | POST   | Logout (clear cookie)            |
| `/api/auth/sso/redirect` | GET | SSO bridge — set cookie & redirect |

### Konfigurasi Redirect URLs

URL untuk Owlie Chat dan Tax Knowledge dikonfigurasi melalui **Admin Panel** → **Settings** → **Redirects**:
- **Owlie Chat URL**: URL halaman chat TPC-AI (contoh: `http://192.168.0.46:3000/chat`)
- **Tax Knowledge URL**: URL halaman pencarian regulasi (contoh: `http://192.168.0.46:3000/search`)

---

## Dokumentasi API

Dokumentasi lengkap API autentikasi tersedia di:
- [`docs/api/AUTH_API.md`](docs/api/AUTH_API.md) — Dokumentasi Markdown
- [`docs/api/auth-openapi.json`](docs/api/auth-openapi.json) — OpenAPI 3.0 Specification

---

## Tech Stack

| Teknologi         | Versi     | Kegunaan                     |
|-------------------|-----------|------------------------------|
| Next.js           | 16.1.6    | Framework React full-stack   |
| React             | 19.2.3    | UI library                   |
| Tailwind CSS      | 4.x       | Styling                      |
| Prisma            | 6.11.1    | ORM & database migrations    |
| PostgreSQL        | 14+       | Database                     |
| Framer Motion     | 12.x      | Animasi                      |
| Midtrans          | Snap SDK  | Payment gateway              |
| Vitest            | 4.x       | Testing framework            |
| TypeScript        | 5.x       | Type safety                  |

---

## Lisensi

Proprietary — Taxindo Prime Consulting © 2026
