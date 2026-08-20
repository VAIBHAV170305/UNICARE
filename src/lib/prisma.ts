import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

function initSqliteTables(dbFilePath: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require("better-sqlite3");
    const db = new Database(dbFilePath);
    db.exec(`
      CREATE TABLE IF NOT EXISTS User (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'USER',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS Profile (
        id TEXT PRIMARY KEY,
        userId TEXT UNIQUE NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        height REAL NOT NULL,
        weight REAL NOT NULL,
        medicalHistory TEXT NOT NULL,
        allergies TEXT NOT NULL,
        healthGoals TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES User (id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS AuditLog (
        id TEXT PRIMARY KEY,
        userId TEXT,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        ipAddress TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    db.close();
  } catch (e) {
    console.warn("[Prisma] Failed to initialize SQLite tables:", e);
  }
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL || "file:./dev.db";

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
      const prismaPath = path.resolve(process.cwd(), "prisma", "dev.db");
      if (!fs.existsSync(tmpPath)) {
        if (fs.existsSync(localPath)) {
          fs.copyFileSync(localPath, tmpPath);
        } else if (fs.existsSync(prismaPath)) {
          fs.copyFileSync(prismaPath, tmpPath);
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

  initSqliteTables(dbFilePath);

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  const adapter = new PrismaBetterSqlite3({ url: dbFilePath });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
