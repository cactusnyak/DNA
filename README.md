# DNA Platform

DNA Platform is a unified web platform combining an online marketplace, a classifieds board, order processing, delivery workflows, and user services.

## Environments

* Staging: https://stage.dna-platform.shop
* Production: https://dna-platform.shop

The `dev` branch is automatically tested, built, and deployed to staging. Production is deployed from `main`.

## Core Features

* marketplace with a hierarchical catalog, category pages, and product pages;
* classifieds board with ad creation, editing, and moderation;
* unified feed combining products and classified ads;
* search, filtering, sorting, and category navigation;
* favorites and cart support for products and ads;
* checkout, order status tracking, and YooKassa payments;
* delivery calculation and manager-assisted processing for oversized products;
* configurable product additions and options;
* user profiles, balances, and a referral program;
* one-time password authentication and Yandex OAuth;
* role-based access for users, sellers, and administrators;
* admin panel for managing the catalog, ads, orders, users, and delivery requests;
* image uploads to local or S3-compatible storage;
* audit logging for privileged and potentially destructive administrative operations.

## Technology Stack

### Frontend

* React 19 and TypeScript;
* Vite;
* React Router;
* TanStack Query for server state and request caching;
* Zustand for client-side state;
* Tailwind CSS, Radix UI, and shadcn for the interface.

### Backend

* Node.js 22 and TypeScript;
* NestJS 11;
* Prisma ORM;
* PostgreSQL 17;
* JWT, OTP, and OAuth authentication;
* Swagger/OpenAPI documentation for the REST API;
* Jest and Supertest for unit and end-to-end testing;
* SMS.RU integration for production OTP delivery;
* Nodemailer for email delivery;
* AWS SDK for S3-compatible storage.

### Infrastructure

* Docker and Docker Compose;
* Caddy as a reverse proxy, HTTPS server, and static SPA server;
* GitHub Actions for continuous integration and automated staging deployment;
* isolated staging and production Docker Compose projects;
* separate frontend and backend Docker images.

## Architecture

The project consists of two applications: a client-side SPA in `web` and a REST API in `api`. They are developed independently but can be launched together from the repository root. In the local environment, Vite proxies `/api` and `/uploads` requests to NestJS; Caddy handles this responsibility in staging and production.

The frontend is organized into domain-oriented layers. Pages handle routing and interface composition, widgets assemble larger user scenarios, features contain standalone user actions, entities represent domain models and their APIs, and shared provides reusable infrastructure and types. Server data is loaded and cached with TanStack Query, while local session, cart, and favorites state is managed with Zustand.

The backend is a modular NestJS application. Dedicated domain modules handle the marketplace, classified ads, users, orders, payments, favorites, referrals, oversized delivery, the unified feed, and administrative operations. Controllers expose the REST API, services contain business logic, and Prisma encapsulates access to PostgreSQL. Marketplace and classifieds categories are represented as separate hierarchical structures.

All API routes use the `/api` prefix. Global interceptors and exception filters normalize successful responses and errors. Incoming DTOs are validated by a global `ValidationPipe`; Helmet, CORS, request rate limiting, and role-based guards are also enabled. Interactive API documentation is available at `/api/docs` while the backend is running.

Image storage is abstracted from the underlying provider: files can be stored locally during development and in an S3-compatible object storage service in production. The database schema and its change history are managed with Prisma migrations, while dedicated seed scripts create demo and production data.

Staging and production run as isolated Docker Compose projects with separate databases, upload volumes, environment files, and application containers. The production Caddy instance terminates HTTPS connections and proxies the staging domain to the staging web container through a shared Docker network.

## Local Development

You will need Node.js 22, npm, and Docker with Docker Compose.

1. Install the dependencies:

   ```bash
   npm run install:all
   ```

2. Create the local API configuration:

   ```bash
   cp api/.env.example api/.env
   ```

3. Start PostgreSQL:

   ```bash
   npm run db:up
   ```

4. Apply the migrations and optionally add demo data:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Start the frontend and backend:

   ```bash
   npm run dev
   ```

Once started, the frontend is available at http://localhost:5173, the API at http://localhost:3000/api, and Swagger UI at http://localhost:3000/api/docs.

## Configuration

The main backend environment variables are listed in `api/.env.example`:

* PostgreSQL connection and JWT secrets;
* frontend URL for CORS and OAuth redirects;
* OTP delivery provider and security limits;
* SMS.RU credentials, sender, template, test mode, and optional callbacks;
* SMTP settings for email delivery;
* Yandex OAuth settings;
* local or S3-compatible storage configuration;
* payment provider settings;
* a flag that enables exceptional permanent order deletion by the owner.

Environment-specific configuration is stored outside version control:

* `api/.env` for local development;
* `.env.staging` on the staging server;
* `.env.production` on the production server.

Secrets and production configuration must never be committed to the repository.

### YooKassa payments

The API accepts one-stage (`capture: true`) payments through the embedded
YooKassa widget and sends fiscal receipt data for every order. Configure each
environment with `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY`,
`YOOKASSA_VAT_CODE=1`, `YOOKASSA_EXPECTED_TEST_MODE`, and optionally
`YOOKASSA_REQUEST_TIMEOUT_MS`.

Development and staging use test shop `1430696` with
`YOOKASSA_EXPECTED_TEST_MODE=true`. Production uses live shop `1403591` with
`YOOKASSA_EXPECTED_TEST_MODE=false`. Store both secret keys only in the
environment-specific secret files described above.

For HTTP Basic Auth, subscribe to `payment.succeeded` and `payment.canceled`
in the YooKassa dashboard. Use these HTTPS notification URLs:

* staging: `https://stage.dna-platform.shop/api/payments/webhook`;
* production: `https://dna-platform.shop/api/payments/webhook`.

## Useful Commands

| Command                                       | Description                                                                              |
| --------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `npm run dev`                                 | Start PostgreSQL, the API, and the frontend in development mode                          |
| `npm run dev:api`                             | Start PostgreSQL and the API                                                             |
| `npm run dev:web`                             | Start only the frontend                                                                  |
| `npm run db:up`                               | Start the local PostgreSQL instance                                                      |
| `npm run db:down`                             | Stop the local PostgreSQL instance                                                       |
| `npm run db:migrate`                          | Create or apply a Prisma migration in development mode                                   |
| `npm run db:seed`                             | Populate the database with demo data                                                     |
| `npm run build --prefix web`                  | Build the frontend                                                                       |
| `npm run build --prefix api`                  | Build the backend                                                                        |
| `npm test --prefix api`                       | Run backend unit tests                                                                   |
| `npm run test:e2e --prefix api`               | Run backend end-to-end tests                                                             |
| `npm run sms-ru:check --prefix api`           | Check SMS.RU credentials, sender, balance, limits, and configuration without sending SMS |
| `npm run sms-ru:callback:list --prefix api`   | List SMS.RU callbacks                                                                    |
| `npm run sms-ru:callback:add --prefix api`    | Register `SMS_RU_WEBHOOK_URL` explicitly                                                 |
| `npm run sms-ru:callback:delete --prefix api` | Delete `SMS_RU_WEBHOOK_URL` explicitly                                                   |

## Deployment

### Staging

Every push to `dev` triggers the `CI & Deploy` GitHub Actions workflow. The workflow:

1. runs the backend tests and build;
2. builds the frontend;
3. connects to the VPS over SSH;
4. deploys the current `origin/dev` revision using the isolated staging Compose project;
5. verifies the staging frontend and readiness endpoint.

The staging environment uses:

* domain: `stage.dna-platform.shop`;
* project directory: `/home/deploy/dna-staging`;
* environment file: `.env.staging`;
* Compose file: `docker-compose.staging.yml`;
* Compose project: `dna-staging`;
* deployment script: `/home/deploy/bin/deploy-staging.sh`.

### Production

Production is deployed from `main` and uses:

* domain: `dna-platform.shop`;
* project directory: `/opt/dna`;
* environment file: `.env.production`;
* Compose file: `docker-compose.production.yml`;
* deployment script: `/opt/dna/deploy.sh`.

`docker-compose.production.yml` starts PostgreSQL, the NestJS API, and the frontend served by Caddy. Caddy serves the compiled SPA, proxies `/api` and `/uploads` to the backend, terminates HTTPS connections, and routes staging traffic to the isolated staging web container.

Apply database migrations before deploying application code that depends on them:

```bash
cd api
npx prisma migrate deploy
```

The production readiness endpoint is available at:

```text
https://dna-platform.shop/api/health/ready
```

The staging readiness endpoint is available at:

```text
https://stage.dna-platform.shop/api/health/ready
```

## SMS.RU OTP Rollout

Local development uses `OTP_DELIVERY_PROVIDER=console`. Production phone delivery requires `OTP_DELIVERY_PROVIDER=sms_ru`, a strong `OTP_HASH_SECRET`, `SMS_RU_API_ID`, an approved `SMS_RU_SENDER_NAME`, and an operator-approved message matching `SMS_RU_OTP_MESSAGE_TEMPLATE`.

Start with `SMS_RU_TEST_MODE=true`, run:

```bash
npm run sms-ru:check --prefix api
```

Only switch test mode off after the diagnostic check succeeds. The command validates the configuration without sending an SMS.

SMS.RU failures for insufficient balance (`201`), unavailable operator and sender combinations (`204`), missing sender approval (`221`), template mismatch (`222`), and frequency controls (`230–233`) are converted into safe public errors.

Sender approval for one mobile operator does not imply approval for other operators. T2 authorization pricing requires separate approval of the exact OTP template.

Callback management is deliberately manual and never runs during application startup or deployment. Incoming callback parsing should remain disabled until the current payload format has been captured from an official or test callback.

Public OTP forms have database-backed rate limits. CAPTCHA should be added before high-volume promotion; no CAPTCHA provider is currently configured.
