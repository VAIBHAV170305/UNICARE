import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

const isPostgres = (url: string) =>
  url.startsWith("postgres://") || url.startsWith("postgresql://");

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL || "file:./dev.db";

  if (isPostgres(url)) {
    // Production (Vercel/Render): PostgreSQL via the pg driver adapter.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPg } = require("@prisma/adapter-pg");
    const adapter = new PrismaPg({ connectionString: url });
    return new PrismaClient({ adapter });
  }

  // Local development: SQLite via better-sqlite3.
  // Use an absolute path so the file is found regardless of cwd.
  const relative = url.startsWith("file:") ? url.slice("file:".length) : url;
  const dbPath = path.resolve(process.cwd(), relative);
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
