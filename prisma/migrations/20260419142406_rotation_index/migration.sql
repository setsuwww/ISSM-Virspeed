-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastRotationDate" TIMESTAMP(3),
ADD COLUMN     "rotationIndex" INTEGER NOT NULL DEFAULT 0;
