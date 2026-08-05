import { PrismaClient } from "@/src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// PrismaMariaDb é uma Factory — o PrismaClient chama factory.connect() internamente
// NÃO chamar factory.connect() manualmente
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapterFactory = new PrismaMariaDb({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Clinton",
    database: process.env.DB_NAME || "sge",
    connectionLimit: 5,
  });

  return new PrismaClient({ adapter: adapterFactory }) as unknown as PrismaClient;
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}