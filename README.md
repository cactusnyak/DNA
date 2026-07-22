# DNA Platform

DNA Platform is a unified web platform combining an online marketplace, a classifieds board, order processing, and user services.

## Environments

- Test: [https://dna-demo.netlify.app/](https://dna-demo.netlify.app/)
- Production: [https://dna-platform.shop](https://dna-platform.shop)

## Core Features

- marketplace with a hierarchical catalog, category pages, and product pages;
- classifieds board with ad creation, editing, and moderation;
- unified feed combining products and classified ads;
- search, filtering, sorting, and category navigation;
- favorites and cart support for products and ads;
- checkout, order status tracking, and YooKassa payments;
- user profiles, balances, and a referral program;
- one-time password (OTP) authentication and Yandex OAuth;
- role-based access for users, sellers, and administrators;
- admin panel for managing the catalog, ads, orders, and users;
- image uploads to local or S3-compatible storage;
- audit logging for privileged and potentially destructive administrative operations.

## Technology Stack

### Frontend

- React 19 and TypeScript;
- Vite;
- React Router;
- TanStack Query for server state and request caching;
- Zustand for client-side state;
- Tailwind CSS, Radix UI, and shadcn for the interface.

### Backend

- Node.js 20+ and TypeScript;
- NestJS 11;
- Prisma ORM;
- PostgreSQL 17;
- JWT, OTP, and OAuth authentication;
- Swagger/OpenAPI documentation for the REST API;
- Jest and Supertest for unit and end-to-end testing;
- Nodemailer for delivering one-time codes;
- AWS SDK for S3-compatible storage.

### Infrastructure

- Docker and Docker Compose;
- Caddy as a reverse proxy, HTTPS server, and static SPA server;
- Netlify for the test frontend environment;
- separate frontend and backend Docker images for production.

## Architecture

The project consists of two applications: a client-side SPA in `web` and a REST API in `api`. They are developed independently but can be launched together from the repository root. In the local environment, Vite proxies `/api` and `/uploads` requests to NestJS; Caddy handles this responsibility in production.

The frontend is organized into domain-oriented layers. Pages handle routing and interface composition, widgets assemble larger user scenarios, features contain standalone user actions, entities represent domain models and their APIs, and shared provides reusable infrastructure and types. Server data is loaded and cached with TanStack Query, while local session, cart, and favorites state is managed with Zustand.

The backend is a modular NestJS application. Dedicated domain modules handle the marketplace, classified ads, users, orders, payments, favorites, referrals, the unified feed, and administrative operations. Controllers expose the REST API, services contain business logic, and Prisma encapsulates access to PostgreSQL. Marketplace and classifieds categories are represented as separate hierarchical structures.

All API routes use the `/api` prefix. Global interceptors and exception filters normalize successful responses and errors. Incoming DTOs are validated by a global `ValidationPipe`; Helmet, CORS, request rate limiting, and role-based guards are also enabled. Interactive API documentation is available at `/api/docs` while the backend is running.

Image storage is abstracted from the underlying provider: files can be stored locally during development and in an S3-compatible object storage service in production. The database schema and its change history are managed with Prisma migrations, while dedicated seed scripts create the initial demo data.

## Local Development

You will need Node.js 20.19 or newer, npm, and Docker with Docker Compose.

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

Once started, the frontend is available at [http://localhost:5173](http://localhost:5173), the API at [http://localhost:3000/api](http://localhost:3000/api), and Swagger UI at [http://localhost:3000/api/docs](http://localhost:3000/api/docs).

## Configuration

The main backend environment variables are listed in `api/.env.example`:

- PostgreSQL connection and JWT secret;
- frontend URL for CORS and OAuth redirects;
- SMTP settings for OTP delivery;
- Yandex OAuth settings;
- local or S3-compatible storage configuration;
- a flag that enables exceptional permanent order deletion by the owner.

Secrets and production configuration must not be committed to the repository.

## Useful Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start PostgreSQL, the API, and the frontend in development mode |
| `npm run dev:api` | Start PostgreSQL and the API |
| `npm run dev:web` | Start only the frontend |
| `npm run db:up` | Start the local PostgreSQL instance |
| `npm run db:down` | Stop the local PostgreSQL instance |
| `npm run db:migrate` | Create or apply a Prisma migration in development mode |
| `npm run db:seed` | Populate the database with demo data |
| `npm run build --prefix web` | Build the frontend |
| `npm run build --prefix api` | Build the backend |
| `npm test --prefix api` | Run backend unit tests |
| `npm run test:e2e --prefix api` | Run backend end-to-end tests |

## Production

`docker-compose.production.yml` starts PostgreSQL, the NestJS API, and the frontend served by Caddy. Caddy serves the compiled SPA, proxies `/api` and `/uploads` to the backend, and terminates HTTPS connections. Production settings are supplied through `.env.production` and must be stored outside version control.
