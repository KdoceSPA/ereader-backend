-- CreateTable
CREATE TABLE `book_levels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookId` INTEGER NOT NULL,
    `level` ENUM('prekinder', 'kinder', '1_basico', '2_basico', '3_basico', '4_basico', '5_basico', '6_basico', '7_basico', '8_basico', '1_medio', '2_medio', '3_medio', '4_medio') NOT NULL,

    UNIQUE INDEX `book_levels_bookId_level_key`(`bookId`, `level`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `book_levels` ADD CONSTRAINT `book_levels_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing data: copy each book's current scalar level into the new join table
INSERT INTO `book_levels` (`bookId`, `level`)
SELECT `id`, `level` FROM `books`;

-- AlterTable: now safe to drop the old scalar column
ALTER TABLE `books` DROP COLUMN `level`;
