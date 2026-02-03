/*
  Warnings:

  - You are about to drop the column `createdAt` on the `LeaveType` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `LeaveType` table. All the data in the column will be lost.
  - You are about to drop the column `isPaid` on the `LeaveType` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `LeaveType` table. All the data in the column will be lost.
  - You are about to drop the `leaverequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `schedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shiftchangerequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `leaverequest` DROP FOREIGN KEY `LeaveRequest_approvedById_fkey`;

-- DropForeignKey
ALTER TABLE `leaverequest` DROP FOREIGN KEY `LeaveRequest_leaveTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `leaverequest` DROP FOREIGN KEY `LeaveRequest_userId_fkey`;

-- DropForeignKey
ALTER TABLE `schedule` DROP FOREIGN KEY `Schedule_divisionId_fkey`;

-- DropForeignKey
ALTER TABLE `shiftchangerequest` DROP FOREIGN KEY `ShiftChangeRequest_newShiftId_fkey`;

-- DropForeignKey
ALTER TABLE `shiftchangerequest` DROP FOREIGN KEY `ShiftChangeRequest_oldShiftId_fkey`;

-- DropForeignKey
ALTER TABLE `shiftchangerequest` DROP FOREIGN KEY `ShiftChangeRequest_requestedById_fkey`;

-- DropForeignKey
ALTER TABLE `shiftchangerequest` DROP FOREIGN KEY `ShiftChangeRequest_targetShiftId_fkey`;

-- DropForeignKey
ALTER TABLE `shiftchangerequest` DROP FOREIGN KEY `ShiftChangeRequest_targetUserId_fkey`;

-- DropForeignKey
ALTER TABLE `shiftchangerequest` DROP FOREIGN KEY `ShiftChangeRequest_userId_fkey`;

-- AlterTable
ALTER TABLE `LeaveType` DROP COLUMN `createdAt`,
    DROP COLUMN `description`,
    DROP COLUMN `isPaid`,
    DROP COLUMN `updatedAt`;

-- DropTable
DROP TABLE `leaverequest`;

-- DropTable
DROP TABLE `schedule`;

-- DropTable
DROP TABLE `shiftchangerequest`;

-- CreateTable
CREATE TABLE `Schedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `frequency` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'ONCE') NOT NULL DEFAULT 'ONCE',
    `startDate` DATETIME(3) NULL,
    `startTime` VARCHAR(191) NULL,
    `endDate` DATETIME(3) NULL,
    `endTime` VARCHAR(191) NULL,
    `divisionId` INTEGER NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaveRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `leaveTypeId` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `totalDays` INTEGER NOT NULL,
    `reason` VARCHAR(191) NULL,
    `adminReason` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `approvedById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `LeaveRequest_userId_idx`(`userId`),
    INDEX `LeaveRequest_leaveTypeId_idx`(`leaveTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShiftChangeRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `requestedById` INTEGER NOT NULL,
    `targetUserId` INTEGER NULL,
    `oldShiftId` INTEGER NULL,
    `newShiftId` INTEGER NULL,
    `targetShiftId` INTEGER NULL,
    `reason` VARCHAR(191) NOT NULL,
    `rejectReason` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `status` ENUM('PENDING', 'PENDING_TARGET', 'PENDING_ADMIN', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING_TARGET',
    `verifiedByTarget` BOOLEAN NOT NULL DEFAULT false,
    `verifiedByAdmin` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_divisionId_fkey` FOREIGN KEY (`divisionId`) REFERENCES `Division`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SchedulesOnUsers` ADD CONSTRAINT `SchedulesOnUsers_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `Schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScheduleReminder` ADD CONSTRAINT `ScheduleReminder_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `Schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_leaveTypeId_fkey` FOREIGN KEY (`leaveTypeId`) REFERENCES `LeaveType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShiftChangeRequest` ADD CONSTRAINT `ShiftChangeRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShiftChangeRequest` ADD CONSTRAINT `ShiftChangeRequest_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShiftChangeRequest` ADD CONSTRAINT `ShiftChangeRequest_targetUserId_fkey` FOREIGN KEY (`targetUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShiftChangeRequest` ADD CONSTRAINT `ShiftChangeRequest_oldShiftId_fkey` FOREIGN KEY (`oldShiftId`) REFERENCES `Shift`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShiftChangeRequest` ADD CONSTRAINT `ShiftChangeRequest_newShiftId_fkey` FOREIGN KEY (`newShiftId`) REFERENCES `Shift`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShiftChangeRequest` ADD CONSTRAINT `ShiftChangeRequest_targetShiftId_fkey` FOREIGN KEY (`targetShiftId`) REFERENCES `Shift`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
