const { PrismaClient } = require('@prisma/client');

let prisma;

try {
  const dbUrl = process.env.DATABASE_URL || '';
  // If the DATABASE_URL is empty or contains placeholders, construct a syntactically valid dummy string to avoid startup crash
  if (
    !dbUrl || 
    dbUrl.includes('[PASSWORD]') || 
    dbUrl.includes('[PROJECT-ID]') || 
    !dbUrl.startsWith('postgresql://')
  ) {
    console.warn('⚠️ Malformed/Placeholder DATABASE_URL detected. Setting a safe dummy connection string to prevent Prisma startup crash.');
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:5432/dummy_db?connect_timeout=3';
  }
  
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
} catch (err) {
  console.warn('❌ Prisma client startup validation failed, creating fallback proxy:', err.message);
  prisma = new Proxy({}, {
    get: (target, prop) => {
      return () => {
        throw new Error('Database is offline (Prisma client failed to instantiate)');
      };
    }
  });
}

module.exports = prisma;
