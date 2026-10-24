import { PrismaClient } from "@prisma/client";

function sanitizeDbUrl(url?: string): string | undefined {
  if (!url) return url;
  let cleaned = url
    .replace(/[?&]channel_binding=[^&]*/g, "")
    .replace(/[?&]channel_binding(?=[&#]|$)/g, "")
    .replace(/\?&/, "?")
    .replace(/\?$/, "");
  if (cleaned.includes("-pooler.") && !cleaned.includes("pgbouncer=true")) {
    cleaned += (cleaned.includes("?") ? "&" : "?") + "pgbouncer=true&connect_timeout=15&connection_limit=1";
  }
  return cleaned;
}

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = sanitizeDbUrl(process.env.DATABASE_URL);
}
if (process.env.DATABASE_URL_UNPOOLED) {
  process.env.DATABASE_URL_UNPOOLED = sanitizeDbUrl(process.env.DATABASE_URL_UNPOOLED);
}
if (!process.env.DATABASE_URL_UNPOOLED && process.env.DATABASE_URL) {
  process.env.DATABASE_URL_UNPOOLED = process.env.DATABASE_URL;
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
