import { PrismaClient } from "../generated/client";
import fs from "fs";
import path from "path";

declare global {
  // eslint-disable-next-line no-var
  var storePrisma: PrismaClient | undefined;
}

// Default to production Supabase database
const SUPABASE_DEFAULT_URL =
  "postgres://postgres.aydgnokektxslpaukbou:5ORmfa7GDe1wQJ8t@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true";

// Helper to eagerly load .env if not loaded in process.env
function loadEnvFiles() {
  const candidatePaths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), "apps/store/.env"),
    path.resolve(process.cwd(), "apps/store/.env.local"),
    path.resolve(__dirname, "../../.env"),
    path.resolve(__dirname, "../../.env.local"),
    path.resolve(__dirname, "../../../.env"),
  ];

  for (const envFile of candidatePaths) {
    try {
      if (fs.existsSync(envFile)) {
        const content = fs.readFileSync(envFile, "utf8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
            const idx = trimmed.indexOf("=");
            const key = trimmed.slice(0, idx).trim();
            let val = trimmed.slice(idx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (!process.env[key] && val) {
              process.env[key] = val;
            }
          }
        }
      }
    } catch {
      // Ignore read errors
    }
  }
}

loadEnvFiles();

export function getStoreDbUrl(): string {
  loadEnvFiles();
  const env = process.env;
  const envKeys = Object.keys(env);

  // 1. High-priority check for Supabase environment variables
  const supabaseCandidateKeys = [
    "POSTGRES_PRISMA_URL",
    "SUPABASE_POSTGRES_PRISMA_URL",
    "DATABASE_URL",
    "POSTGRES_URL",
    "SUPABASE_POSTGRES_URL",
    "SUPABASE_DATABASE_URL",
    "POSTGRES_URL_NON_POOLING",
    "SUPABASE_POSTGRES_URL_NON_POOLING",
    "DIRECT_URL",
  ];

  let bestKey = supabaseCandidateKeys.find(
    (k) => env[k] && typeof env[k] === "string" && env[k]!.trim().length > 0 && !env[k]!.includes("localhost:5432")
  );

  // 2. Check for any environment variable containing SUPABASE in the name
  if (!bestKey) {
    bestKey = envKeys.find(
      (k) =>
        k.toUpperCase().includes("SUPABASE") &&
        (k.includes("PRISMA_URL") || k.includes("DATABASE_URL") || k.includes("POSTGRES_URL")) &&
        env[k] &&
        typeof env[k] === "string" &&
        env[k]!.trim().length > 0 &&
        !env[k]!.includes("localhost:5432")
    );
  }

  // 3. Check for any variable whose value targets Supabase hosts
  if (!bestKey) {
    bestKey = envKeys.find(
      (k) =>
        env[k] &&
        typeof env[k] === "string" &&
        (env[k]!.includes("supabase.co") || env[k]!.includes("pooler.supabase.com"))
    );
  }

  // 4. Standard DATABASE_URL
  if (!bestKey && env.DATABASE_URL && !env.DATABASE_URL.includes("vercel-storage.com") && !env.DATABASE_URL.includes("localhost:5432")) {
    bestKey = "DATABASE_URL";
  }

  let dbUrl = (bestKey ? env[bestKey]?.trim() : undefined) || SUPABASE_DEFAULT_URL;

  // Clean schema parameter: change schema=store to schema=public (Supabase tables reside in public)
  if (
    dbUrl.startsWith("postgres://") ||
    dbUrl.startsWith("postgresql://") ||
    dbUrl.startsWith("prisma://")
  ) {
    try {
      const urlObj = new URL(dbUrl);
      if (urlObj.searchParams.get("schema") === "store") {
        urlObj.searchParams.set("schema", "public");
        dbUrl = urlObj.toString();
      }
    } catch {
      if (dbUrl.includes("schema=store")) {
        dbUrl = dbUrl.replace("schema=store", "schema=public");
      }
    }
  }

  process.env.DATABASE_URL = dbUrl;
  return dbUrl;
}

const storeDbUrl = getStoreDbUrl();

export const prisma =
  global.storePrisma ||
  new PrismaClient({
    datasources: { db: { url: storeDbUrl } },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.storePrisma = prisma;
}

export default prisma;
