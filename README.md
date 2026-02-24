# Regional IT Management System (RIMS) - MVP

RIMS MVP based on `Regional_IT_Management_System_Documentation.pdf`, now with an optional `PostgreSQL + Prisma` persistence path and an in-memory fallback mode.

## What is included

- Next.js App Router + TypeScript + Tailwind CSS project scaffold
- Mock authentication (Admin / Staff) using HTTP-only session cookies
- Role-based access control (RBAC) for admin-only user management actions
- User account management UI and API (create, delete, role changes)
- Immutable activity logging UI and API (login, logout, admin actions)
- System monitoring dashboard with mock CPU / Disk / Network indicators
- Security runbook page covering backup/recovery concepts for Phase 2
- Optional PostgreSQL persistence via Prisma (`DATABASE_URL`-based)

## Demo credentials

- Admin: `admin / admin123`
- Staff: `staff / staff123`

## Run locally

1. Install dependencies
   - `npm install`
2. Start development server
   - `npm run dev`
3. Open
   - `http://localhost:3000`

## PostgreSQL + Prisma setup (optional, recommended)

1. Copy env file
   - Create `.env` from `.env.example`
2. Set your PostgreSQL connection string in `DATABASE_URL`
3. Generate Prisma client
   - `npm run prisma:generate`
4. Create database schema
   - `npm run prisma:push`
5. Seed demo data
   - `npm run prisma:seed`
6. Start app
   - `npm run dev`

If `DATABASE_URL` is not set (or Prisma is unavailable), the app automatically falls back to the in-memory store.

## Project structure

- `app/` - App Router pages and API route handlers
- `components/` - Client and shared UI modules
- `lib/store.ts` - In-memory mock data store and domain logic
- `lib/data.ts` - Async data facade (Prisma when available, memory fallback)
- `lib/prisma-store.ts` - Prisma-backed domain operations
- `prisma/schema.prisma` - Database schema
- `lib/auth.ts` - Session cookie helpers and request auth guards
- `middleware.ts` - Route protection for authenticated pages

## Notes

- In memory mode, data resets when the server restarts.
- Prisma mode currently keeps demo password handling simple (plaintext) for compatibility with the MVP.
- Password handling is intentionally simplified for demo purposes.
- For production, replace cookie encoding with signed or server-backed sessions.

## Next upgrades (recommended)

- Password hashing + secure session storage
- Persistent audit log storage
- Hardened auth/session management
- Ticket/incident management module
- Region/branch-level access restrictions
- Deployment and infrastructure automation
