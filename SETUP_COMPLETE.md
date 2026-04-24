# ✅ Nook Setup Complete

Your new Next.js project with Cloudflare Workers has been created successfully!

## What's Ready

- ✅ Next.js 16 + React 19 with TypeScript
- ✅ Tailwind CSS 4 + shadcn/ui component library
- ✅ Drizzle ORM with SQLite (D1) database
- ✅ Cloudflare R2 storage integration
- ✅ JWT authentication with PBKDF2 password hashing
- ✅ Middleware for route protection
- ✅ Server Actions (no API routes needed)
- ✅ Local development environment configured
- ✅ Git initialized with initial commit

## Start Development

```bash
# Navigate to the project
cd /Users/jorgewingeyer/Herd/nook

# Start the development server
pnpm dev
```

Then open: **`https://nook.localhost:1355`**

## Test the Application

**Login with:**
- Email: `admin@nook.local`
- Password: `password`

You'll be redirected to a simple dashboard. The left sidebar shows navigation and a logout button.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Public login/change-password pages
│   ├── (secure)/          # Protected pages (require login)
│   └── globals.css        # Global Tailwind styles
├── db/
│   ├── schema.ts          # Database tables defined here
│   ├── seed.sql           # Initial test data
│   └── seed.prod.sql      # Production seed (empty)
├── lib/
│   ├── session.ts         # JWT auth logic
│   ├── db.ts              # Drizzle ORM setup
│   ├── storage.ts         # R2 file operations
│   ├── constants.ts       # Environment variables
│   └── utils.ts           # Utility functions
├── scripts/
│   └── db-fresh.ts        # Database reset script
└── middleware.ts          # Route protection & redirects
```

## Common Tasks

### Add a New Database Table

1. Edit `src/db/schema.ts` and add your table:
```typescript
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  price: real("price").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});
```

2. Generate migration:
```bash
pnpm db:generate
pnpm db:migrate:local
```

### Create a Server Action

Create `src/actions/products/create.action.ts`:
```typescript
"use server";

import { getDb } from "@/lib/db";
import { products } from "@/db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function createProductAction(name: string, price: number) {
  try {
    const { env } = await getCloudflareContext();
    const db = getDb((env as any).DB);
    
    await db.insert(products).values({ name, price });
    return { success: true };
  } catch (error) {
    return { error: "Failed to create product" };
  }
}
```

### Use in a Component

```typescript
"use client";

import { createProductAction } from "@/actions/products/create.action";

export function ProductForm() {
  const handleSubmit = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    
    const result = await createProductAction(name, price);
    if (result.error) {
      alert(result.error);
    } else {
      alert("Product created!");
    }
  };

  return (
    <form action={handleSubmit}>
      <input name="name" required />
      <input name="price" type="number" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

## Environment Setup for Production

When deploying to Cloudflare:

1. Create D1 database:
```bash
wrangler d1 create nook
```

2. Create R2 bucket:
```bash
wrangler r2 bucket create nook-assets
```

3. Update `wrangler.jsonc` with the database ID and bucket name

4. Set production environment variables via Cloudflare dashboard

5. Deploy:
```bash
pnpm deploy
```

## Documentation

- **CLAUDE.md** — Complete architecture and development guide
- **README.md** — Project overview
- **[Next.js Docs](https://nextjs.org)** — Framework documentation
- **[Drizzle Docs](https://orm.drizzle.team)** — ORM documentation
- **[Tailwind Docs](https://tailwindcss.com)** — CSS framework

## Key Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm db:generate` | Generate migrations |
| `pnpm db:migrate:local` | Apply migrations locally |
| `pnpm db:seed:local` | Seed test data |
| `pnpm db:studio` | Open Drizzle Studio (DB GUI) |
| `pnpm db:migrate:fresh` | Reset and reapply all migrations |
| `pnpm deploy` | Deploy to Cloudflare Workers |

## Next Steps

1. Read [CLAUDE.md](./CLAUDE.md) for full documentation
2. Start the dev server: `pnpm dev`
3. Log in and explore the dashboard
4. Add your first database table
5. Create a Server Action for it
6. Build a page to display and manage your data

---

**Happy coding!** 🚀

For help, check CLAUDE.md or explore the existing code — everything is documented and ready to extend.
