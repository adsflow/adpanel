/**
 * prisma/seed.ts
 *
 * Seeds the database with the initial admin user.
 *
 * Run with:
 *   npm run db:seed
 *
 * Safe to re-run — uses upsert, so it will update the existing record if the
 * email already exists rather than throwing a duplicate-key error.
 *
 * To change the admin credentials before first deploy, edit the constants
 * below or set SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD environment variables.
 */

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

// ---------------------------------------------------------------------------
// Admin credentials — override via env vars for CI/CD pipelines
// ---------------------------------------------------------------------------
const ADMIN_EMAIL =
  process.env.SEED_ADMIN_EMAIL ?? "marketing@scaleadsflow.com";

const ADMIN_PASSWORD =
  process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe!2024";

const ADMIN_NAME =
  process.env.SEED_ADMIN_NAME ?? "Görkem Güney";

// ---------------------------------------------------------------------------
// Bootstrap a standalone PrismaClient for the seed script.
// We cannot import from lib/prisma.ts because that module is written for
// the Next.js runtime environment; here we run under plain Node/tsx.
// ---------------------------------------------------------------------------
function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local or export it before running the seed."
    );
  }

  const normalized = url.replace(/^mysql:\/\//, "mariadb://");
  const parsed = new URL(normalized);

  const config = {
    host: parsed.hostname,
    port: parsed.port ? parseInt(parsed.port, 10) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ""),
    connectionLimit: 2,
    ssl: false,
  };

  const adapter = new PrismaMariaDb(config);
  return new PrismaClient({ adapter });
}

// ---------------------------------------------------------------------------
// Seed logic
// ---------------------------------------------------------------------------
async function main() {
  const prisma = createClient();

  try {
    console.log("Seeding database...\n");

    // Hash with cost factor 12 — same as the API route uses for portal passwords
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const user = await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      create: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "ADMIN",
      },
      update: {
        // On re-run: refresh the name and re-hash the password in case it changed
        name: ADMIN_NAME,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    console.log("Admin user seeded successfully:");
    console.log(`  ID:    ${user.id}`);
    console.log(`  Name:  ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role:  ${user.role}`);
    console.log(`  Since: ${user.createdAt.toISOString()}`);
    console.log(
      "\nIMPORTANT: Change the default password before deploying to production."
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
