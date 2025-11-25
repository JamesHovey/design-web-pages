const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('Adding globalHeaderConfig column...');
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "globalHeaderConfig" JSONB'
    );
    console.log('✓ Migration applied successfully!');
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
