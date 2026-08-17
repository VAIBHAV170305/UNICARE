import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL || "file:./dev.db";

  if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaPg } = require("@prisma/adapter-pg");
      const adapter = new PrismaPg({ connectionString: url });
      return new PrismaClient({ adapter });
    } catch (e) {
      console.warn("[Prisma] Adapter-pg initialization failed, using default client:", e);
      return new PrismaClient();
    }
  }

  // On Vercel / serverless runtime or production without native C++ sqlite bindings
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return new PrismaClient();
  }

  // Local development: SQLite via better-sqlite3
  try {
    const relative = url.startsWith("file:") ? url.slice("file:".length) : url;
    const dbPath = path.resolve(process.cwd(), relative);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
    return new PrismaClient({ adapter });
  } catch (e) {
    console.warn("[Prisma] BetterSqlite3 adapter failed, using default client:", e);
    return new PrismaClient();
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
