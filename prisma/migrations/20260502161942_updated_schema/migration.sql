-- CreateEnum
CREATE TYPE "CheckInStatus" AS ENUM ('EARLY_CHECKIN', 'PRESENT', 'LATE', 'ABSENT', 'LEAVE', 'PERMISSION');

-- CreateEnum
CREATE TYPE "CheckOutStatus" AS ENUM ('NORMAL', 'EARLY_CHECKOUT', 'FORGOT_CHECKOUT', 'OVERTIME');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AttendanceStatus" ADD VALUE 'EARLY_CHECKOUT';
ALTER TYPE "AttendanceStatus" ADD VALUE 'LEAVE';
ALTER TYPE "AttendanceStatus" ADD VALUE 'OVERTIME';

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "checkInStatus" "CheckInStatus",
ADD COLUMN     "checkOutStatus" "CheckOutStatus";
