# SSO URL Switch Implementation Plan

## Overview
Enable the admin panel to switch between local (`http://localhost:3000`) and production (`https://taxindo.ai`) SSO endpoints by changing a single environment variable.

## Tech Stack
- `lib/sso.ts` (SSO URL generators)
- `.env` (stores `AUTH_BASE_URL`, default: local)
- Helper function `getAuthBaseOrLocal()`
- Admin login page with environment toggle (optional)
- `/api/admin/login/route.ts` updated to respect the environment variable

## Proposed Changes

### 1. Update `lib/sso.ts`
- Add function `getAuthBaseOrLocal()` that:
  - Checks `process.env.AUTH_BASE_URL`
  - If it starts with `https://`, use it (production)
  - Otherwise, return `http://localhost:3000` (local)
- Export `AUTH_BASE_URL` using `getAuthBaseOrLocal()`

### 2. Update `app/admin-tpc/login/page.tsx`
- Add "Switch Environment" link/button
  - Points to `/api/admin/switch-env`
  - Shows current environment (Local vs Production)
  - When "Production" is active, show message "You are connecting to the production Auth Center"

### 3. Update `app/api/admin/login/route.ts`
- Ensure SSO login endpoint calls the correct Auth Center URL
  - Production: `https://taxindo.ai/login`
  - Local: `http://localhost:3000/login`
- Use `getAuthBaseOrLocal()` from `lib/sso.ts`

### 4. Create `app/api/admin/switch-env/route.ts` (Optional)
- Protected admin route `POST /api/admin/switch-env`
- Updates `AUTH_BASE_URL` in `.env`
- Requires server restart (can be done manually or via automated process)
- Restrict access to ADMIN role only

## Implementation Tasks

1. Add `getAuthBaseOrLocal()` helper function to `lib/sso.ts`
2. Update SSO URL generation to use the new helper function
3. Update `/api/admin/login/route.ts` to use the helper function
4. Create `/api/admin/switch-env/route.ts` for environment switching
5. Update login page to display current environment and provide switch button
6. Test SSO login with local Auth Center
7. Test SSO login with production Auth Center
8. Verify role-based redirects work correctly

## Verification
- SSO login works with both local and production Auth Center URLs
- Environment switch updates `.env` correctly
- Non-admin users are redirected to `/my-profile`
- Admin users can access the admin panel after SSO login
