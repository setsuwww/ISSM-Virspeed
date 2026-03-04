/*
  Warnings:

  - You are about to drop the `UserShiftAssignment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."UserShiftAssignment" DROP CONSTRAINT "UserShiftAssignment_shiftId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserShiftAssignment" DROP CONSTRAINT "UserShiftAssignment_userId_fkey";

-- DropTable
DROP TABLE "public"."UserShiftAssignment";
