/*
  Warnings:

  - You are about to drop the column `type` on the `leaverequest` table. All the data in the column will be lost.
  - Added the required column `leaveTypeId` to the `LeaveRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalDays` to the `LeaveRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `leaverequest` DROP COLUMN `type`,
    ADD COLUMN `leaveTypeId` INTEGER NOT NULL,
    ADD COLUMN `totalDays` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `UserLeaveBalance` (
    `userId` INTEGER NOT NULL,
    `leaveTypeId` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `totalDays` INTEGER NOT NULL,
    `usedDays` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`userId`, `leaveTypeId`, `year`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaveType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` ENUM('ANNUAL', 'SICK', 'MATERNITY', 'MARRIAGE', 'BEREAVEMENT', 'RELIGIOUS', 'SPECIAL') NOT NULL,
    `maxDays` INTEGER NOT NULL,
    `isPaid` BOOLEAN NOT NULL DEFAULT true,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LeaveType_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `LeaveRequest_leaveTypeId_idx` ON `LeaveRequest`(`leaveTypeId`);

-- AddForeignKey
ALTER TABLE `UserLeaveBalance` ADD CONSTRAINT `UserLeaveBalance_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserLeaveBalance` ADD CONSTRAINT `UserLeaveBalance_leaveTypeId_fkey` FOREIGN KEY (`leaveTypeId`) REFERENCES `LeaveType`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_leaveTypeId_fkey` FOREIGN KEY (`leaveTypeId`) REFERENCES `LeaveType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `leaverequest` RENAME INDEX `LeaveRequest_userId_fkey` TO `LeaveRequest_userId_idx`;
