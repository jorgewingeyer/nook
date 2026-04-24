# Nook — Project Documentation

## Quick Start

### Setup

1. Copy environment files:
   ```bash
   cp .env.local.example .env.local
   cp .dev.vars.example .dev.vars
   ```

2. Generate a secure `SESSION_SECRET` (minimum 32 characters):
   ```bash
   openssl rand -base64 32
   ```
   Update both `.env.local` and `.dev.vars` with this value.

3. Install `portless` globally (for HTTPS local development):
   ```bash
   npm install -g portless
   portless proxy start --https
   ```

4. Install dependencies:
   ```bash
   pnpm install
   ```

5. Set up the database:
   ```bash
   pnpm db:migrate:local
   pnpm db:seed:local
   ```

6. Start development server:
   ```bash
   pnpm dev
   ```

Server runs at `https://nook.localhost:1355`

**Test login:** `admin@nook.local` / `password`

---

## Development Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start dev server with HTTPS |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
| `pnpm deploy` | Build and deploy to Cloudflare Workers |
| `pnpm preview` | Build and preview with Cloudflare runtime |
| `pnpm db:generate` | Generate Drizzle migrations from schema |
| `pnpm db:migrate:local` | Apply migrations to local D1 |
| `pnpm db:migrate:prod` | Apply migrations to production D1 |
| `pnpm db:migrate:fresh` | Reset local database and reapply all migrations |
| `pnpm db:seed:local` | Seed local database with test data |
| `pnpm db:studio` | Open Drizzle Studio to view/edit database |
| `pnpm cf-typegen` | Regenerate Cloudflare environment types |

---

## Architecture

### Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Runtime:** Cloudflare Workers via OpenNext adapter
- **Database:** Cloudflare D1 (SQLite) + Drizzle ORM
- **Storage:** Cloudflare R2
- **UI:** React 19, Tailwind CSS 4, shadcn/ui, Radix UI
- **Auth:** JWT (HS256) with PBKDF2 password hashing
- **Language:** TypeScript with strict mode

### Key Design Decisions

1. **No API Routes** — All mutations use Next.js Server Actions (`src/actions/`)
2. **Serverless-First** — Designed for Cloudflare Workers; local dev uses Wrangler emulation
3. **JWT Auth** — Stateless sessions via `jose` + httpOnly cookies
4. **D1/R2 Bindings** — Cloudflare resources injected via wrangler; accessed through `src/lib/db.ts` and `src/lib/storage.ts`

### Folder Structure

```
src/
  app/                    # Next.js App Router
    (auth)/              # Public auth pages (login, change-password)
    (secure)/            # Protected pages (require login)
  actions/               # Server Actions (future: organized by domain)
  components/
    ui/                  # shadcn/ui components (auto-generated)
  db/
    schema.ts            # Drizzle schema definitions
    seed.sql             # Local test data
    seed.prod.sql        # Production seed (empty)
  lib/
    constants.ts         # Environment constants
    db.ts                # Drizzle ORM instance
    session.ts           # JWT encryption/decryption, password hashing
    storage.ts           # R2 operations wrapper
    utils.ts             # Utilities (cn() for tailwind merging)
  middleware.ts          # Route protection and redirects
  scripts/
    db-fresh.ts          # Database reset script
```

---

## Database Schema

Currently one table:

### users
- `id` — Primary key
- `name` — User's full name
- `email` — Unique email
- `password` — PBKDF2-SHA256 hash
- `role` — Enum: `admin` | `agent`
- `isActive` — Boolean flag
- `mustChangePassword` — Forces password change on next login
- `createdAt` — Unix timestamp

**Migrations:** Stored in `drizzle/` directory. Generated via `pnpm db:generate`, applied with `pnpm db:migrate:local`.

---

## Authentication Flow

1. User logs in at `/login` → `loginAction()` verifies email/password
2. Session cookie set with JWT payload: `{ userId, role, mustChangePassword, expiresAt }`
3. Middleware checks every request; protects `(secure)/*` routes
4. If `mustChangePassword` is true, user redirected to `/change-password`
5. Admin routes (`/users`, `/settings`) check `role === "admin"`
6. Sign out deletes session cookie

**Password Hashing:** PBKDF2-SHA256 (100k iterations), salted with `SESSION_SECRET`

---

## Environment Variables

### Required

- **SESSION_SECRET** (min. 32 chars) — Used for JWT signing and password salt

### Cloudflare (wrangler.jsonc)

- **DB** — D1 database binding
- **R2_BUCKET** — R2 bucket binding
- **ASSETS** / **IMAGES** / **WORKER_SELF_REFERENCE** — OpenNext bindings

### Updating Cloudflare Resources

After creating D1 and R2 in Cloudflare:

1. Update `database_id` in `wrangler.jsonc` under `d1_databases[0].database_id`
2. Update `bucket_name` in `wrangler.jsonc` under `r2_buckets[0].bucket_name`
3. Regenerate types: `pnpm cf-typegen`

---

## Code Conventions

- **Server Actions:** Named `*.action.ts`, return `{ error?: string }` or `{ error?: string, data?: T }`
- **Components:** Use shadcn/ui; import from `@/components/ui`
- **Styling:** Tailwind + `cn()` utility from `@/lib/utils`
- **Database:** Always use `getDb(env.DB)` to access Drizzle; schema in `@/db/schema`
- **No Comments:** Only document non-obvious logic or workarounds
- **Path Alias:** `@/` resolves to `src/`

---

## Deployment to Cloudflare Workers

1. Ensure D1/R2 resources exist in your Cloudflare account
2. Update `wrangler.jsonc` with correct resource IDs
3. Run `pnpm deploy`

The OpenNext adapter compiles the Next.js app to a Cloudflare Worker.

---

## Local Database Emulation

Wrangler emulates D1 and R2 locally:

- **D1:** Stores SQLite file in `.wrangler/state/v3/d1/...`
- **R2:** Stores files in `.wrangler/state/v3/r2/...`

These directories are git-ignored; each `pnpm dev` session starts fresh from migrations.

---

## Testing

Currently no automated tests. To manually test:

1. `pnpm dev`
2. Navigate to `https://nook.localhost:1355/login`
3. Log in with `admin@nook.local` / `password`
4. Verify dashboard loads and sidebar renders
5. Test admin routes (`/users`, `/settings`) if logged in as admin
6. Test logout functionality

---

## Next Steps

- Add shadcn/ui components as needed: `pnpm dlx shadcn@latest add <component>`
- Create domain-specific Server Actions in `src/actions/<domain>/`
- Define additional database tables in `src/db/schema.ts`
- Build feature pages under `src/app/(secure)/`
