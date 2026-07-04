# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

DNA is a marketplace/classifieds monorepo with two independent apps that are not otherwise wired together by tooling (no root package.json, no workspaces):

- `api/` — NestJS 11 backend (TypeScript, Prisma ORM, PostgreSQL).
- `web/` — React 19 + Vite frontend (TypeScript, Tailwind v4, shadcn/ui, Zustand, TanStack Query, react-router-dom v7).

Run commands from inside `api/` or `web/` respectively — there is no root-level script runner.

## Commands

### api/

```bash
npm run start:dev      # watch mode (default for local dev)
npm run build           # nest build
npm run lint             # eslint --fix
npm run format           # prettier --write
npm run test             # jest unit tests
npm run test -- categories.service.spec.ts   # run a single test file
npm run test:watch
npm run test:cov
npm run test:e2e        # jest with test/jest-e2e.json config
npm run seed             # tsx prisma/seed.ts
```

Prisma: schema is `api/prisma/schema.prisma`, migrations live in `api/prisma/migrations/`. Use the standard `npx prisma migrate dev`, `npx prisma generate` from within `api/`. The Prisma client uses the `@prisma/adapter-pg` driver adapter (see `api/src/prisma/prisma.service.ts`) rather than Prisma's built-in connection handling, so `DATABASE_URL` must point at a reachable Postgres (see `docker-compose.yml` at repo root for local Postgres on port 5433).

### web/

```bash
npm run dev        # vite dev server on :5173, proxies /api and /uploads to http://localhost:3000
npm run build       # tsc -b && vite build
npm run lint
npm run preview
```

There is no test runner configured in `web/`.

### Local infra

`docker-compose.yml` at the repo root spins up Postgres only (`dna-postgres`, exposed on host port 5433). Start it with `docker compose up -d` before running the API against a local DB.

## Architecture

### Domain model

Core Prisma models (`api/prisma/schema.prisma`): `User` (roles: `DEFAULT`, `REFERRAL_PARTNER`, `SELLER`, `ADMIN`), `Category` (self-referential tree via `parentId`), `Product`, `CartItem`, `Order`/`OrderItem`, `Referral`/`ReferralReward`/`ReferralLevel` (multi-level referral program), `CatalogCollection` (curated groupings of categories or products, e.g. for homepage sections), `Balance` (user cashback/referral balance), `Image` (shared by user avatars, categories, and products).

Categories and products use soft delete (`deletedAt`) plus an `isActive` flag. Public-facing queries filter on both (see `ACTIVE_CATEGORY_WHERE` / `ACTIVE_PRODUCT_WHERE` constants repeated in `categories.service.ts` and `products.service.ts`); admin endpoints expose separate hard-delete and restore actions per resource (see `admin.controller.ts`).

### Two platform sections: `market` vs `ads`

The product shares one catalog engine (`Category`/`Product` tables, `CategoriesService`/`ProductsService`) between two user-facing "sections":

- **market** (`MarketController`, `/api/market/*`) — the real, fully implemented e-commerce catalog.
- **ads** (`AdsController`, `/api/ads/*`) — a classifieds/listings board that is currently a stub (`findCategories()` just returns `[]`). Treat `ads` endpoints as scaffolding, not a finished feature, when working on backend catalog logic.

On the frontend this split is modeled by `web/src/shared/platform/platform-sections.ts` (`PLATFORM_SECTION.MARKET` / `PLATFORM_SECTION.ADS`), which drives routing (`/market/*` vs `/ads/*`), labels, and API scope for shared widgets like `Catalog`, `CategoryPage`, `CatalogDropdown`. When adding catalog/category/product UI, prefer parameterizing by section over duplicating widgets — the existing widgets (e.g. `CatalogPage`, `CategoryPage`) already take a `section` prop for this reason. Legacy `/catalog/*`, `/categories/*`, `/product/:id` routes exist only to redirect into `/market/...` (see `router.tsx`).

### Auth

Custom-rolled, not `@nestjs/jwt` or Passport: `api/src/auth/token.service.ts` hand-signs/verifies HMAC-SHA256 tokens (base64url header/payload/signature, `JWT_SECRET` env var, 7-day TTL) and `password.service.ts` handles hashing. `AuthGuard` (`api/src/auth/guards/auth.guard.ts`) reads the `Authorization: Bearer <token>` header and attaches `request.user`; `RolesGuard` + `@Roles(...)` decorator enforce role checks off `request.user.role`. Admin routes are gated with `@UseGuards(AuthGuard, RolesGuard)` + `@Roles(UserRole.ADMIN)` at the controller level (see `admin.controller.ts`).

On the frontend, the access token is persisted via Zustand (`entities/auth/model/auth-store.ts`, localStorage key `dna-auth`), separate from `entities/session` which holds derived session/user state.

### Frontend structure (feature-sliced-ish)

`web/src` follows a layered structure, importable via the `@/*` path alias (see `vite.config.ts` / `tsconfig.app.json`):

- `app/` — router (`app/router/router.tsx`), layouts, providers (React Query).
- `pages/` — route-level components, one per URL, composed almost entirely of a single widget.
- `widgets/` — the actual feature implementations (e.g. `widgets/Catalog`, `widgets/Admin`, `widgets/Checkout`). Each widget owns its own `components/`, `logic/` (pure helper functions, unit-testable), `hooks/`, and `types/` subfolders — mirror this layout when adding to an existing widget rather than putting logic directly in the top-level component file.
- `entities/` — domain data layer: API calls (`api/`), types (`types/`), and any client-side stores (`model/`) per entity (`auth`, `user`, `product`, `category`, `order`, `cart`, `balance`, `referral`, `admin`, `session`).
- `shared/` — cross-cutting utilities with no domain knowledge: `shared/api/http-client.ts` (thin fetch wrapper, auto-prefixes `/api`, JSON in/out), `shared/platform` (market/ads section config), `shared/utils`, `shared/types`.
- `components/ui/` — shadcn/ui primitives (`components.json` config: style `radix-nova`, base color `neutral`, icons via `lucide-react`).

The `AdminManagement` widget (`widgets/Admin/components/AdminManagement`) is a generic CRUD table/form framework driven by config (`logic/get-admin-table-*`, `AdminCrudForm` with per-resource `*CrudFields` components) shared across categories, products, catalog collections, and orders in the admin panel — extend it via config/fields rather than writing a new admin table from scratch.

### Referral tree

`ReferralsService.getReferralTree` recursively walks the `Referral` self-relation up to `REFERRAL_TREE_MAX_DEPTH` (4) levels, guarding against cycles with a `visitedUserIds` set and masking deleted users' names as "Удалённый Пользователь". Rewards accrue per order via `ReferralReward`, keyed to both the referral and the order.

## Conventions

- Prettier: single quotes, trailing commas everywhere (`api/.prettierrc`); web has no separate prettier config, follow existing formatting.
- API modules follow standard Nest structure per feature: `*.module.ts`, `*.controller.ts`, `*.service.ts`, colocated `*.spec.ts`, `dto/` for validated input shapes.
- API service methods accept `unknown` request bodies in controllers and do their own narrowing/validation inside the service (see `AuthService`'s private `getEmail`/`getPassword`/etc., and `AdminController` passing `body: unknown` straight through) rather than relying on class-validator DTOs everywhere — follow this pattern for new admin endpoints unless a DTO already exists.
- All API responses are shaped by hand-written mapper methods on services (e.g. `ProductsService.mapProduct`) rather than returning raw Prisma entities — keep new endpoints consistent with this to avoid leaking internal fields (password hashes, etc.).
