-- AlterTable
ALTER TABLE `books` ADD COLUMN `fileType` ENUM('epub', 'pdf') NOT NULL DEFAULT 'epub';
