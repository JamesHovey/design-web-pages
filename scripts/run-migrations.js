const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('🔄 Running database migrations...');

    // Add globalHeaderConfig column if it doesn't exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Project"
      ADD COLUMN IF NOT EXISTS "globalHeaderConfig" JSONB
    `);

    console.log('✅ Database migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
