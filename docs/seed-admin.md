# Admin seeding

## Environment requirements

Set these in `.env` before running `npm run seed:admin` (the script loads `.env` automatically):

- `DATABASE_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Optional flags:

- `SEED_RESET_PASSWORD` (set to `true` to overwrite existing password)
- `SEED_ALLOW_PROD` (set to `true` to allow seeding in production)
