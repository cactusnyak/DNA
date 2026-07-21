---
name: testing-dna-marketplace
description: How to run and end-to-end test the DNA marketplace (NestJS api/ + React-Vite web/). Covers startup, OTP login, seeded accounts, admin panel, order lifecycle endpoints, and a known Linux case-sensitivity frontend build blocker.
---

# Testing the DNA marketplace

Monorepo: `api/` = NestJS backend (global prefix `/api`), `web/` = React/Vite frontend.

## Startup
- Use Node 22 at runtime (repo needs >=20.19; default VM Node 20.18 breaks Prisma):
  `export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22.12.0`
- DB: `docker compose up -d` (Postgres in container `dna-postgres`, host port **5433**, db `dna`, user `dna_user`, pass `dna_password`).
- Backend: `set -a && . api/.env && set +a && (cd api && npx prisma migrate deploy && npx prisma generate) && npm run start:dev --prefix api` → http://localhost:3000, Swagger `/api/docs`.
- Frontend: `npm install --prefix web` (vite may be missing), then `npm run dev --prefix web` → http://localhost:5173.
- Seed: `npm run db:seed` (root) or `npm run seed --prefix api`.

## Login is OTP, NOT password
The UI has no password login. Use the OTP flow:
1. Enter email on `/authorization`, click "Получить код".
2. Read the code from Postgres:
   `docker exec dna-postgres psql -U dna_user -d dna -t -c "select code from \"OtpCode\" where login='<email>' order by \"createdAt\" desc limit 1;"`
3. Enter the 6-digit code.

For **API** auth (curl), the OTP endpoints REQUIRE a `mode` field (`login` or `register`):
```
curl -sX POST localhost:3000/api/auth/otp/send   -H 'Content-Type: application/json' -d '{"login":"admin@dna.ru","mode":"login"}'
curl -sX POST localhost:3000/api/auth/otp/verify -H 'Content-Type: application/json' -d '{"login":"admin@dna.ru","code":"<code>","mode":"login"}'
```
`verify` returns `data.accessToken` (JWT). Each code is single-use — send a fresh one per verify.

## Seeded accounts
`admin@dna.ru` (ADMIN), `seller@dna.ru`/`seller2@dna.ru` (SELLER), `partner@dna.ru` (REFERRAL_PARTNER), `ivan@mail.ru`/`maria@mail.ru`/`sergey@gmail.com` (DEFAULT). Admin panel link "Админка" appears in the nav after admin login; route is `/admin`.

## Order lifecycle endpoints (PR: api-normalization)
- `DELETE /api/admin/orders/:id` now **archives** (sets `archivedAt`), it does NOT hard-delete. Archived orders drop out of the active admin list. The UI delete button/dialog still says "навсегда" (stale copy).
- `POST /api/admin/orders/:id/archive` / `/restore`; list filter `GET /api/admin/orders?archived=false|true|all&page&pageSize`.
- `DELETE /api/admin/orders/:id/permanent` is OWNER/ULTRA_ADMIN only (ADMIN → 403 from the roles guard, generic "Access denied"). Confirmation body must be exactly `{"reason":"...","confirmation":"DELETE ORDER <id>"}`. In non-production it is enabled regardless of `HARD_DELETE_ORDERS_ENABLED`. On success it deletes the order + items + referral rewards and writes an `AuditEvent` (`action=ORDER_HARD_DELETE`).
- To test the OWNER success path, temporarily promote a spare user: `update "User" set role='OWNER' where email='sergey@gmail.com';`, OTP-login to get an OWNER token, run the delete, then revert the role.
- Health: `GET /api/health`, `/api/health/live`, `/api/health/ready` (ready reports `checks.database.status`). Root `GET /api` returns `{name:"DNA API",status,docs}`.

## Known blocker: Linux case-sensitive imports (frontend)
On case-sensitive filesystems the web app fails to start with unresolved imports:
- `@/components/ui/Button` but file is `web/src/components/ui/button.tsx`.
- lowercase `components/` imports but directories are `Components/` under `web/src/widgets/Catalog*` and `web/src/widgets/CatalogDropdown`.
Workaround for local testing only (do NOT commit): add a `Button.tsx` copy and lowercase `components` symlinks pointing at the `Components` dirs. Proper fix is consistent casing. This is independent of backend PRs (their `web/` diff is often empty).

## Gotchas
- `computer` `type` action can't enter Cyrillic (xdotool). Use Latin text for free-text fields (checkout name/address accept it).
- The working tree may carry prettier-style formatting-only diffs across `api/src/**` (no logic change); `git diff -w` to confirm, `git checkout -- api/src` to clear before merge.

## Devin Secrets Needed
None — everything runs locally with seeded data.
