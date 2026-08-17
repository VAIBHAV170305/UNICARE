import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const url = process.env.DATABASE_URL || "file:./dev.db";

const isPostgres = url.startsWith("postgres://") || url.startsWith("postgresql://");
const provider = isPostgres ? "postgresql" : "sqlite";

const schemaPath = "./prisma/schema.prisma";
let schema = readFileSync(schemaPath, "utf8");
schema = schema.replace(
  /provider\s*=\s*"(sqlite|postgresql|mysql)"/,
  `provider = "${provider}"`
);
writeFileSync(schemaPath, schema);

console.log(`[setup-db] DATABASE_URL provider: ${provider}`);

execSync("npx prisma generate", { stdio: "inherit" });

if (isPostgres) {
  console.log(`[setup-db] Syncing schema for postgresql...`);
  try {
    execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
    console.log(`[setup-db] postgresql schema sync complete ✓`);
  } catch (err) {
    console.warn(`[setup-db] DB push warning:`, err.message);
  }
}
