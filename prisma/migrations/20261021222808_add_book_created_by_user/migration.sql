-- AlterTable
ALTER TABLE `books` ADD COLUMN `createdByUserId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `books` ADD CONSTRAINT `books_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
