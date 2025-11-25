import { PrismaClient } from '@/prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

declare global {
  var prisma: PrismaClient | undefined;
}

// Strip sslmode from connection string to allow programmatic SSL config
const connectionString = process.env.DATABASE_URL?.replace(/[?&]sslmode=[^&]+/, '') || '';

// Create a connection pool
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});
const adapter = new PrismaPg(pool);

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    adapter,
    log: ['query']
  });
} else {
  // Lazy-load Prisma for dev (Turbopack)
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      adapter,
      log: ['query']
    });
  }
  prisma = global.prisma;
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      if (i === retries - 1) throw err;
      console.warn(`Retry ${i + 1} after Prisma connection error`);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error("Prisma retry failed");
}

export { prisma, withRetry };