import { PrismaClient } from '@prisma/client';

export async function runMigrations() {
  const prisma = new PrismaClient();

  try {
    console.log('🔄 Checking database schema...');

    // Add globalHeaderConfig column if it doesn't exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Project"
      ADD COLUMN IF NOT EXISTS "globalHeaderConfig" JSONB
    `);

    console.log('✅ Database schema is up to date');
    return true;
  } catch (error) {
    console.error('❌ Migration error:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}
