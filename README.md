# Nook

A modern full-stack Next.js application template with Cloudflare Workers, D1 database, R2 storage, and JWT authentication.

## Features

- ✨ **Next.js 16** with App Router and React 19
- 🔐 **JWT Authentication** with PBKDF2 password hashing
- 🗄️ **Cloudflare D1** (SQLite) with Drizzle ORM
- 📦 **Cloudflare R2** for file storage
- 🎨 **shadcn/ui** components with Tailwind CSS v4
- ⚡ **Server Actions** for mutations (no API routes)
- 🚀 **OpenNext** adapter for Workers deployment
- 🛡️ **Middleware** for route protection and role-based access

## Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Setup environment:**
   ```bash
   cp .env.local.example .env.local
   cp .dev.vars.example .dev.vars
   ```

3. **Initialize database:**
   ```bash
   pnpm db:migrate:local
   pnpm db:seed:local
   ```

4. **Start dev server:**
   ```bash
   pnpm dev
   ```

Visit `https://nook.localhost:1355` and log in with:
- **Email:** `admin@nook.local`
- **Password:** `password`

## Documentation

See [CLAUDE.md](./CLAUDE.md) for complete documentation including:
- Development commands
- Architecture overview
- Database schema
- Authentication flow
- Code conventions
- Deployment instructions

## Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Next.js 16 |
| **Styling** | Tailwind CSS 4, shadcn/ui |
| **Backend** | Next.js Server Actions |
| **Database** | Cloudflare D1 + Drizzle ORM |
| **Storage** | Cloudflare R2 |
| **Runtime** | Cloudflare Workers |
| **Auth** | JWT + PBKDF2 |

## License

MIT
