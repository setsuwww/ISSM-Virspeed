-- AlterTable
ALTER TABLE `attendance` ADD COLUMN `divisionStatus` ENUM('ACTIVE', 'INACTIVE') NULL,
    ADD COLUMN `divisionType` ENUM('WFO', 'WFA') NULL;
