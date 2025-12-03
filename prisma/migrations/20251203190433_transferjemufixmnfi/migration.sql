-- AlterTable
ALTER TABLE `add_to_carts` ADD COLUMN `isWaitlist` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `cart_items` ADD COLUMN `isWaitlist` BOOLEAN NOT NULL DEFAULT false;
