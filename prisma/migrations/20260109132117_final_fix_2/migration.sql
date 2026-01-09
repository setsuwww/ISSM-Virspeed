/*
  Warnings:

  - Added the required column `type` to the `LeaveRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `leaverequest` ADD COLUMN `type` ENUM('ANNUAL', 'MATERNITY', 'SICK') NOT NULL,
    MODIFY `reason` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `schedule` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;
