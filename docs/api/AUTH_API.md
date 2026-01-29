# Auth Center API

Dokumentasi ini khusus untuk Auth Center (login/register/profile/plan). Cocok dipakai oleh aplikasi lain yang mengarahkan user ke halaman login/register Auth Center.

## Base URL
- Production: https://taxindo.ai
- Local: http://localhost:3000

## Session & Cookie
- Cookie: `tpc_session` (HttpOnly, SameSite=Lax, domain = AUTH_COOKIE_DOMAIN)
- User login sekali, cookie bisa dipakai lintas subdomain (SSO).

## API Key (Third-Party Apps)
- Jika request berasal dari origin yang berbeda dengan Auth Center, wajib sertakan `x-api-key`.
- API key dibuat di Admin Panel > Integration Management.
- API key bisa dibatasi dengan allowlist domain/IP per key.
- Global Firewall di Integration Management juga bisa membatasi IP/domain untuk semua endpoint.

Header contoh:
- `x-api-key: YOUR_API_KEY`

## Redirect Allowlist
- Gunakan `app_id` + `redirect_uri`.
- `redirect_uri` wajib ada di allowlist AuthApp (tabel `AuthApp`).
- Seed registry lewat env `AUTH_APPS_JSON`.

## Endpoints

### POST /api/auth/login
Login user.

Body:
- email (string, required)
- password (string, required)
- appId (string, optional) — juga menerima `app_id`
- redirectUri (string, optional) — juga menerima `redirect_uri`
- state (string, optional)

Response 200:
- user: { id, email, name, role, plan, avatarUrl }
- redirectTo: string | null

Jika `appId + redirectUri` dikirim dan valid, `redirectTo` berisi URL redirect.

### POST /api/auth/register
Register user baru.

Body:
- name (string, optional)
- email (string, required)
- password (string, required)
- appId (string, optional)
- redirectUri (string, optional)
- state (string, optional)

Response 200:
- user: { id, email, name, role, plan, avatarUrl }
- redirectTo: string | null

Catatan:
- Avatar user akan dibuat otomatis menggunakan DiceBear.

### POST /api/auth/logout
Logout user (hapus session dan cookie).

Response 200:
- ok: true

### GET /api/auth/me
Profil ringkas + plan + usage.

Response 200:
- user: { id, email, name, role, plan, avatarUrl }
- plan: { allowedModels, limits, remaining }
- usage: { period, counts }

### GET /api/profile
Profil detail + kuota.

Response 200:
- user: { id, email, name, role, plan, avatarUrl, createdAt, updatedAt }
- plan: { allowedModels, limits, remaining }
- usage: { period, counts }

### GET /api/me/avatar
Dapatkan URL avatar user.

Response 200:
- avatarUrl: string | null

### PUT /api/me/avatar
Update/regenerate avatar user (DiceBear).

Body:
- seed (string, optional) - Seed untuk generate avatar unik
- style (string, optional) - Style avatar (default: bottts)

Response 200:
- avatarUrl: string
- seed: string
- style: string

### GET /api/plans
Daftar plan dan kuotanya.

Response 200:
- plans: { FREE, BASIC, PLUS, MAX }

### GET /api/public/plan-prices
Public pricing untuk display (read-only, tanpa API key).

Query (opsional):
- plan (FREE | BASIC | PLUS | MAX)
- interval (MONTHLY | YEARLY)
- currency (default: IDR)

Response 200:
- { prices: [{ plan, interval, currency, amount }] }

Catatan:
- Tetap tunduk pada Global Firewall (IP/domain/CORS) jika diaktifkan.

### GET /api/auth/authorize
Validasi redirect untuk user yang sudah login.

Query:
- app_id (string, required)
- redirect_uri (string, required)
- state (string, optional)

Response 200:
- redirectTo: string
- app: { appId, name }

### POST /api/billing/change-plan
Ubah plan user (dipakai oleh billing/purchasing platform).

Auth:
- Header `x-api-key` (BILLING_API_KEY) **atau**
- `Authorization: Bearer <BILLING_API_KEY>` **atau**
- Admin session cookie

Body:
- userId (uuid, optional)
- email (string, optional)
- plan (FREE | BASIC | PLUS | MAX) [required]

Response 200:
- { id, email, plan, updatedAt }

Catatan:
- Wajib mengisi salah satu dari `userId` atau `email`.

### GET /api/billing/users
List semua user (dipakai oleh billing/purchasing platform).

Auth:
- Header `x-api-key` (BILLING_API_KEY) **atau**
- `Authorization: Bearer <BILLING_API_KEY>` **atau**
- Admin session cookie

Query (opsional):
- q (string): cari di email/nama
- plan (FREE | BASIC | PLUS | MAX)
- role (ADMIN | USER)

Response 200:
- { users: [{ id, email, name, role, plan, avatarUrl, createdAt, updatedAt }] }

### GET /api/billing/plan-prices
List harga plan (bulanan/tahunan).

Auth:
- Header `x-api-key` (BILLING_API_KEY atau Integration key) **atau**
- Admin session cookie

Query (opsional):
- plan (FREE | BASIC | PLUS | MAX)
- interval (MONTHLY | YEARLY)
- currency (default: IDR)

Response 200:
- { prices: [{ plan, interval, currency, amount }] }

### POST /api/billing/plan-prices
Buat/update harga plan (bulanan/tahunan). Upsert by (plan, interval, currency).

Auth:
- Header `x-api-key` (BILLING_API_KEY atau Integration key) **atau**
- Admin session cookie

Body:
- { plan, interval, currency?, amount }
- atau array of items

Response 200:
- { prices: [...] }

### DELETE /api/billing/plan-prices
Hapus harga plan.

Auth:
- Header `x-api-key` (BILLING_API_KEY atau Integration key) **atau**
- Admin session cookie

Query (required):
- plan
- interval
- currency (optional, default: IDR)

Response 200:
- { success: true }

---

## Catatan Integrasi Aplikasi Lain
1) Redirect user ke `/login` atau `/register` dengan `app_id` + `redirect_uri`.
2) Setelah login, redirect balik dengan cookie `tpc_session` sudah aktif.
3) Aplikasi panggil `GET /api/auth/me` atau `GET /api/profile` untuk info plan.
4) Jika origin berbeda, wajib sertakan `x-api-key`.
