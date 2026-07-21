/*
  Warnings:

  - You are about to drop the column `document` on the `clients` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cpf]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cnpj]` on the table `clients` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `clients_document_key` ON `clients`;

-- AlterTable
ALTER TABLE `clients` DROP COLUMN `document`,
    ADD COLUMN `addressCity` VARCHAR(255) NULL,
    ADD COLUMN `addressComplement` VARCHAR(255) NULL,
    ADD COLUMN `addressNumber` VARCHAR(20) NULL,
    ADD COLUMN `addressState` VARCHAR(2) NULL,
    ADD COLUMN `addressStreet` VARCHAR(255) NULL,
    ADD COLUMN `addressZip` VARCHAR(10) NULL,
    ADD COLUMN `birthDate` DATETIME(3) NULL,
    ADD COLUMN `cnpj` VARCHAR(18) NULL,
    ADD COLUMN `cpf` VARCHAR(14) NULL,
    ADD COLUMN `email` VARCHAR(255) NULL,
    ADD COLUMN `foundedDate` DATETIME(3) NULL,
    ADD COLUMN `gender` VARCHAR(1) NULL,
    ADD COLUMN `initialBalance` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `legalName` VARCHAR(255) NULL,
    ADD COLUMN `phone` VARCHAR(20) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `clients_cpf_key` ON `clients`(`cpf`);

-- CreateIndex
CREATE UNIQUE INDEX `clients_cnpj_key` ON `clients`(`cnpj`);
