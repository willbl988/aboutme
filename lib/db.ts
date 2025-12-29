import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL is not set. Database operations will fail.')
  console.warn('   Please create a .env file with your DATABASE_URL')
  console.warn('   See SETUP.md for instructions')
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
          ? process.env.DATABASE_URL.includes('pgbouncer=true')
            ? process.env.DATABASE_URL
            : process.env.DATABASE_URL.includes(':6543')
            ? `${process.env.DATABASE_URL}${process.env.DATABASE_URL.includes('?') ? '&' : '?'}pgbouncer=true&connection_limit=1`
            : process.env.DATABASE_URL.replace(':5432', ':6543') + `${process.env.DATABASE_URL.includes('?') ? '&' : '?'}pgbouncer=true&connection_limit=1`
          : undefined,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

