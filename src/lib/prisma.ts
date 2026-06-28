import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const isMySQL = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("mysql://");

let prismaInstance: PrismaClient;

if (isMySQL) {
  prismaInstance = globalForPrisma.prisma || new PrismaClient();
} else {
  // Use absolute path to ensure the SQLite db file is always found if not using MySQL
  const dbPath = path.resolve(process.cwd(), "dev.db");
  const adapter = new PrismaBetterSqlite3({
    url: `file:${dbPath}`,
  });
  prismaInstance = globalForPrisma.prisma || new PrismaClient({ adapter });
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
