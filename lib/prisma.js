import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prismaClient = globalThis.prisma || new PrismaClient({ 
  adapter,
  // Optional: Add error formatting for better debugging
  errorFormat: 'pretty',
});

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prismaClient;
}

export const db = prismaClient;