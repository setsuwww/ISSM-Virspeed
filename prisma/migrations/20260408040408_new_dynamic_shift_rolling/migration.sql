/*
  Warnings:

  - You are about to drop the column `adminReason` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `earlyCheckoutReason` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `locationStatus` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `locationType` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Attendance` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[assignmentId]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPERVISOR';

-- DropIndex
DROP INDEX "Attendance_userId_shiftId_date_key";

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "adminReason",
DROP COLUMN "createdAt",
DROP COLUMN "earlyCheckoutReason",
DROP COLUMN "locationStatus",
DROP COLUMN "locationType",
DROP COLUMN "reason",
DROP COLUMN "updatedAt",
ADD COLUMN     "assignmentId" INTEGER,
ADD COLUMN     "workEnd" TIMESTAMP(3),
ADD COLUMN     "workStart" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ShiftAssignment" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "shiftId" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "isLeave" BOOLEAN NOT NULL DEFAULT false,
    "isManualOverride" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShiftAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShiftAssignment_userId_date_idx" ON "ShiftAssignment"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ShiftAssignment_userId_date_key" ON "ShiftAssignment"("userId", "date");

-- CreateIndex
CREATE INDEX "Attendance_workStart_workEnd_idx" ON "Attendance"("workStart", "workEnd");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_assignmentId_key" ON "Attendance"("assignmentId");

-- AddForeignKey
ALTER TABLE "ShiftAssignment" ADD CONSTRAINT "ShiftAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftAssignment" ADD CONSTRAINT "ShiftAssignment_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "ShiftAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
