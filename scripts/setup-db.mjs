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

console.log(`[setup-db] DATABASE_URL: ${isPostgres ? "PostgreSQL ✓" : "SQLite (local)"}`);
console.log(`[setup-db] Schema provider set to: ${provider}`);

execSync("npx prisma generate", { stdio: "inherit" });

if (isPostgres) {
  console.log("[setup-db] Pushing schema to PostgreSQL (creates tables if missing)...");
  execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
  console.log("[setup-db] PostgreSQL schema sync complete ✓");
}
