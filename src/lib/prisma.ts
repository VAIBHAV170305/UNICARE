import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
  let url = process.env.DATABASE_URL || "file:./dev.db";

  // PostgreSQL
  if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPg } = require("@prisma/adapter-pg");
    const adapter = new PrismaPg({ connectionString: url });
    return new PrismaClient({ adapter });
  }

  // SQLite (File-based)
  let dbFilePath = "";
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    try {
      const tmpPath = path.join("/tmp", "unicare_dev.db");
      const localPath = path.resolve(process.cwd(), "dev.db");
      if (!fs.existsSync(tmpPath)) {
        if (fs.existsSync(localPath)) {
          fs.copyFileSync(localPath, tmpPath);
        } else {
          fs.writeFileSync(tmpPath, "");
        }
      }
      dbFilePath = tmpPath;
    } catch (e) {
      console.warn("[Prisma] Failed to setup /tmp SQLite DB on Vercel:", e);
      dbFilePath = path.resolve(process.cwd(), "dev.db");
    }
  } else {
    const relative = url.startsWith("file:") ? url.slice("file:".length) : url;
    dbFilePath = path.isAbsolute(relative) ? relative : path.resolve(process.cwd(), relative);
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  const db = new Database(dbFilePath);
  const adapter = new PrismaBetterSqlite3(db);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
