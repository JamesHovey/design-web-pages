-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "referenceStyleMode" TEXT DEFAULT 'industry-matched',
ADD COLUMN     "referenceCount" INTEGER DEFAULT 10,
ADD COLUMN     "customReferenceFiles" JSONB;
