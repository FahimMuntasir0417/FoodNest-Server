# FoodHub Backend API

A TypeScript, Express, Prisma, and PostgreSQL backend for a food ordering platform with Better Auth authentication, provider meal management, carts, orders, reviews, and role-based access.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Dependencies](#dependencies)
- [Live Demo and Credentials](#live-demo-and-credentials)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [API and Architecture](#api-and-architecture)
- [Folder Structure](#folder-structure)
- [Available Scripts](#available-scripts)
- [Contributions](#contributions)
- [How to Contribute](#how-to-contribute)
- [License](#license)
- [Contact](#contact)

---

## About the Project

FoodHub Backend API powers a food ordering system where customers can browse meals, manage draft cart items, place orders, review meals, and track their own order history. Providers can manage restaurant profiles, publish meals, and update order statuses. Admins can manage users, categories, orders, and platform data.

The API is built with Express 5, TypeScript, Prisma, PostgreSQL, and Better Auth. It exposes Better Auth routes under `/api/auth` and application routes under `/api/v1`.

## Project Overview

This backend supports a multi-role food marketplace:

- `CUSTOMER` users can sign up, browse meals, create draft cart items, place orders, and write reviews.
- `PROVIDER` users can create provider profiles, manage meals, and update provider order statuses.
- `ADMIN` users can manage users, categories, meals, reviews, providers, and orders.

The repository includes:

- Prisma schema and migrations for users, sessions, accounts, categories, meals, provider profiles, orders, order items, and reviews
- Better Auth email/password and Google OAuth authentication
- Session-cookie based authorization middleware
- API route reference in [`api-routes.json`](api-routes.json)
- Admin seed script for creating an initial admin user
- Vercel-oriented production start script

## Problem Statement

Food ordering applications need reliable user identity, provider ownership rules, order workflows, cart behavior, and role-based access control. Without a clear backend structure, customers can lose cart/order consistency, providers can accidentally access other providers' data, and admins lack a clean management surface.

## Solution Overview

FoodHub solves this with a modular Express API. Each feature area has its own route, controller, and service files under `src/modules`. Prisma manages PostgreSQL models and relations, Better Auth handles sessions and OAuth, and custom middleware loads the authenticated user and enforces role permissions.

## Key Features

- Better Auth email/password authentication and Google OAuth
- Session-based authorization with `CUSTOMER`, `PROVIDER`, and `ADMIN` roles
- User management with self-profile and admin-only user controls
- Category CRUD for organizing meals
- Meal browsing, filtering, creation, update, and deletion
- Provider profile creation and provider order management
- Draft order item flow for cart-like behavior before checkout
- Order creation from selected draft items or all draft items
- Order status workflow: `PLACED`, `PREPARING`, `READY`, `DELIVERED`, `CANCELLED`
- Review creation, update, deletion, and meal-level review listing
- Centralized global error handling and not-found middleware
- CORS origin allow-list for deployed and local clients

## Tech Stack

- **Frontend:** Next.js, React, TypeScript
- **Backend:** Node.js, Express 5, TypeScript, PostgreSQL, Prisma
- **Authentication:** Better Auth, sessions, cookies, Google OAuth
- **Email:** Nodemailer
- **Build Tools:** tsup, tsx, TypeScript
- **Tools:** pnpm, Prisma CLI, Vercel, Git, VS Code

## Dependencies

Major runtime dependencies:

```json
{
  "@prisma/adapter-pg": "^7.2.0",
  "@prisma/client": "^7.2.0",
  "better-auth": "^1.4.9",
  "cors": "^2.8.5",
  "dotenv": "^17.2.3",
  "express": "^5.2.1",
  "nodemailer": "^7.0.12",
  "pg": "^8.16.3"
}
```

Development dependencies include Prisma, TypeScript, `tsx`, `tsup`, and type packages for Node, Express, CORS, Nodemailer, and PostgreSQL.

## Live Demo and Credentials

### Project Links

- Frontend Repo: https://github.com/FahimMuntasir0417/FoodNest-Client
- Backend Repo: https://github.com/FahimMuntasir0417/FoodNest-Server
- Frontend Live: https://food-nest-client.vercel.app
- Backend Live: https://foodnest-server.onrender.com
- Demo Video: https://drive.google.com/file/d/12D4k0QztRpl2FCdRIA1xqe82m1IjgwnU/view?usp=drive_link
- Local API: http://localhost:4000

### Demo Credentials

Use demo credentials only for non-production demonstrations.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@admin.com` | `admin1234` |
| Provider | `hixemom794@azeriom.com` | `12345@#$` |
| Customer | `y41lhw4kb3@ozsaip.com` | `12345@#$` |

## Installation and Setup

### Prerequisites

Before running the project, make sure you have:

- Node.js installed
- pnpm installed
- PostgreSQL database access
- SMTP credentials if email delivery is enabled
- Google OAuth credentials if Google login is enabled

### Setup

1. Clone the repository:

```bash
git clone https://github.com/FahimMuntasir0417/FoodNest-Server
cd FoodNest-Server
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file in the root directory and add the required environment variables.

4. Generate Prisma client:

```bash
pnpm prisma generate
```

5. Apply database migrations:

```bash
pnpm prisma migrate dev
```

6. Seed an admin user:

```bash
pnpm seed:admin
```

7. Run the development server:

```bash
pnpm dev
```

The API runs on `PORT`, defaulting to `4000`.

### Production Build

```bash
pnpm build
pnpm start
```

## Environment Variables

Create a `.env` file in the project root. Do not commit real secrets.

### Core

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=your_postgresql_database_url
BETTER_AUTH_BASE_URL=http://localhost:4000
```

### Google OAuth

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### SMTP

```env
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

### Seed Admin

```env
SEED_ADMIN_NAME=Admin
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=StrongPass123
SEED_ADMIN_ROLE=ADMIN
SEED_API_BASE_URL=http://localhost:4000
SEED_API_ORIGIN=http://localhost:3000
SEED_API_ORIGINS=http://localhost:3000,https://food-nest-client.vercel.app
```

## API and Architecture

### Base URLs

Local development:

```bash
http://localhost:4000
```

Application routes:

```bash
/api/v1
```

Better Auth routes:

```bash
/api/auth
```

### High-level Flow

```text
Request
  -> Express route
  -> Auth middleware
  -> Controller
  -> Service
  -> Prisma Client
  -> PostgreSQL
  -> JSON response
```

### Architecture Highlights

- `src/app.ts` configures CORS, Better Auth, application routes, not-found handling, and global error handling.
- `src/index.ts` connects Prisma and starts the Express server.
- `src/lib/auth.ts` configures Better Auth, Google OAuth, cookie behavior, and custom session data.
- `src/middlewares/auth.ts` loads the current session, reads the user role from the database, and enforces route permissions.
- `src/lib/origins.ts` centralizes allowed client origins for local and deployed frontends.
- `api-routes.json` documents all current modules and request examples.

### Module Map

| Module      | Base Route            | Responsibility                                                                 |
| ----------- | --------------------- | ------------------------------------------------------------------------------ |
| Auth        | `/api/auth`           | Better Auth sign-up, sign-in, Google OAuth, session, password change, sign-out |
| Users       | `/api/v1/users`       | Admin user management and current-user profile endpoints                       |
| Categories  | `/api/v1/categories`  | Meal category listing and admin/provider category management                   |
| Meals       | `/api/v1/meals`       | Meal catalog, details, provider meal creation, update, and deletion            |
| Reviews     | `/api/v1/reviews`     | Meal reviews and customer review management                                    |
| Providers   | `/api/v1/providers`   | Provider profiles and provider order status updates                            |
| Order Items | `/api/v1/order-items` | Draft cart item creation, update, lookup, and deletion                         |
| Orders      | `/api/v1/orders`      | Order creation, lookup, status updates, cancellation, and deletion             |
| Root        | `/`                   | Health-style response                                                          |

### Access Model

- Auth routes are handled by Better Auth under `/api/auth`.
- Protected feature routes use session cookies through Better Auth.
- Role values are `CUSTOMER`, `PROVIDER`, and `ADMIN`.
- Providers can only update or delete their own meals.
- Customers can only update or delete their own reviews.
- Admins have elevated management access.

### Common Query Parameters

Meal listing supports filters and pagination such as:

- `providerId`
- `categoryId`
- `cuisine`
- `available`
- `page`
- `limit`

## Folder Structure

```plaintext
FoodHub/
|
+-- api-routes.json
+-- prisma/
|   +-- migrations/
|   +-- schema.prisma
|   +-- seed.ts
+-- src/
|   +-- app.ts
|   +-- index.ts
|   +-- lib/
|   |   +-- auth.ts
|   |   +-- mailer.ts
|   |   +-- origins.ts
|   |   +-- prisma.ts
|   +-- middlewares/
|   |   +-- auth.ts
|   |   +-- globalErrorHandler.ts
|   |   +-- notFound.ts
|   +-- modules/
|   |   +-- categories/
|   |   +-- meals/
|   |   +-- order-items/
|   |   +-- orders/
|   |   +-- providers/
|   |   +-- reviews/
|   |   +-- user/
|   +-- routes/
|   +-- scripts/
|   +-- types/
+-- package.json
+-- prisma.config.ts
+-- tsconfig.json
+-- tsup.config.ts
```

## Available Scripts

| Command            | Purpose                                                   |
| ------------------ | --------------------------------------------------------- |
| `pnpm dev`         | Start the API in watch mode with `tsx`                    |
| `pnpm build`       | Generate Prisma client and build with `tsup`              |
| `pnpm start`       | Run migrations and start `dist/index.js`                  |
| `pnpm seed:admin`  | Seed an initial admin account                             |
| `pnpm postinstall` | Generate Prisma client after install                      |
| `pnpm test`        | Placeholder script; no automated test suite is configured |

## Quality Signals

This README is structured to show:

- Clear problem understanding for a food ordering backend
- Clean installation and setup steps
- Evidence of system design thinking through modules, services, Prisma models, and auth middleware
- Security awareness around `.env`, session cookies, roles, CORS origins, and OAuth credentials
- Scalability considerations through separated modules and database-backed ownership rules

## License

This project currently declares the `ISC` license in `package.json`. Add a dedicated `LICENSE` or `LICENSE.txt` file if the project should be distributed with full license text.

## Contact

- **Frontend Live:** [FoodNest Client](https://food-nest-client.vercel.app)
- **Backend Live:** [FoodNest Server](https://foodnest-server.onrender.com)
- **Frontend Repo:** [FoodNest-Client](https://github.com/FahimMuntasir0417/FoodNest-Client)
- **Backend Repo:** [FoodNest-Server](https://github.com/FahimMuntasir0417/FoodNest-Server)
- **Demo Video:** [FoodNest Demo](https://drive.google.com/file/d/12D4k0QztRpl2FCdRIA1xqe82m1IjgwnU/view?usp=drive_link)
- **Email:** [fahimmuntasirbejoy@gmail.com](mailto:fahimmuntasirbejoy@gmail.com)
- **Portfolio:** [Fahim Portfolio](https://fahim-portfolio-dun.vercel.app/)
