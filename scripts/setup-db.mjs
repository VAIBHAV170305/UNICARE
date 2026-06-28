import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const url = process.env.DATABASE_URL || "file:./dev.db";
const isPostgres =
  url.startsWith("postgres://") || url.startsWith("postgresql://");
const provider = isPostgres ? "postgresql" : "sqlite";

const schemaPath = "./prisma/schema.prisma";
let schema = readFileSync(schemaPath, "utf8");
schema = schema.replace(
  /provider\s*=\s*"(sqlite|postgresql|mysql)"/,
  `provider = "${provider}"`
);
writeFileSync(schemaPath, schema);

console.log(`[setup-db] DATABASE_URL detected as: ${isPostgres ? "PostgreSQL" : "SQLite"}`);
console.log(`[setup-db] Set Prisma schema provider to: ${provider}`);
execSync("npx prisma generate", { stdio: "inherit" });
