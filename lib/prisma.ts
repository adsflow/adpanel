/**
 * lib/prisma.ts
 *
 * Prisma 7 singleton for Next.js with the @prisma/adapter-mariadb driver adapter.
 *
 * Why a singleton?
 * Next.js hot-reloads modules in development, which would otherwise create a new
 * PrismaClient (and a new connection pool) on every file change, exhausting the
 * MySQL connection limit quickly. We attach the client to `globalThis` so it
 * survives hot-reloads in dev while still being created fresh in production where
 * modules are never re-imported.
 *
 * Why the MariaDB adapter?
 * Prisma 7 dropped the legacy query engine in favour of driver adapters.
 * Hostinger uses MySQL 8, which is fully compatible with the mariadb npm driver.
 * The adapter accepts a connection config object (NOT a URL string), so we parse
 * DATABASE_URL manually.
 */

import { PrismaClient } from "./generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// ---------------------------------------------------------------------------
// Parse a mysql:// or mariadb:// URL into the config object the driver expects
// ---------------------------------------------------------------------------
function parseDbUrl(url: string): {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
  ssl: boolean;
} {
  // Normalise the scheme so the WHATWG URL parser accepts it
  const normalized = url.replace(/^mysql:\/\//, "mariadb://");

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error(
      `[prisma] DATABASE_URL is not a valid URL. Expected format: mysql://user:password@host:port/database — got: ${url}`
    );
  }

  const host = parsed.hostname;
  const port = parsed.port ? parseInt(parsed.port, 10) : 3306;
  const user = decodeURIComponent(parsed.username);
  const password = decodeURIComponent(parsed.password);
  const database = parsed.pathname.replace(/^\//, "");

  if (!host || !user || !database) {
    throw new Error(
      "[prisma] DATABASE_URL is missing required components (host, user, or database name)."
    );
  }

  return {
    host,
    port,
    user,
    password,
    database,
    // Keep the pool small — Hostinger shared MySQL plans have tight connection limits
    connectionLimit: 5,
    // Set to false for Hostinger plain MySQL; switch to true if your plan enforces SSL
    ssl: false,
  };
}

// ---------------------------------------------------------------------------
// Factory — creates one PrismaClient with the MariaDB driver adapter
// ---------------------------------------------------------------------------
function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "[prisma] DATABASE_URL environment variable is not set. " +
        "Add it to .env.local (dev) or your hosting environment (prod)."
    );
  }

  const config = parseDbUrl(url);
  const adapter = new PrismaMariaDb(config);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });
}

// ---------------------------------------------------------------------------
// Singleton — reuse across hot-reloads in dev; create fresh in prod
// ---------------------------------------------------------------------------
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
