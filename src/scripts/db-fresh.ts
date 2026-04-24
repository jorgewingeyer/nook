import { execSync } from "child_process";

const commands = [
  'echo "Removing old migrations..."',
  "rm -f .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite",
  'echo "Generating migrations..."',
  "pnpm db:generate",
  'echo "Applying migrations..."',
  "pnpm db:migrate:local",
  'echo "Seeding database..."',
  "pnpm db:seed:local",
  'echo "✓ Database reset complete"',
];

try {
  commands.forEach((cmd) => {
    console.log(`> ${cmd}`);
    execSync(cmd, { stdio: "inherit", shell: "/bin/bash" });
  });
} catch (error) {
  console.error("Database reset failed:", error);
  process.exit(1);
}
