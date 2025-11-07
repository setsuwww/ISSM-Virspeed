/*
  Warnings:

  - You are about to drop the `scheduledate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usershiftassignment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `scheduledate` DROP FOREIGN KEY `ScheduleDate_secondShiftId_fkey`;

-- DropForeignKey
ALTER TABLE `scheduledate` DROP FOREIGN KEY `ScheduleDate_shiftId_fkey`;

-- DropForeignKey
ALTER TABLE `usershiftassignment` DROP FOREIGN KEY `UserShiftAssignment_shiftId_fkey`;

-- DropForeignKey
ALTER TABLE `usershiftassignment` DROP FOREIGN KEY `UserShiftAssignment_userId_fkey`;

-- DropTable
DROP TABLE `scheduledate`;

-- DropTable
DROP TABLE `usershiftassignment`;
