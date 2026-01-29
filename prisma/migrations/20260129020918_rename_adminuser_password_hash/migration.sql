/*
  Warnings:

  - You are about to drop the column `password` on the `AdminUser` table. All the data in the column will be lost.
  - Added the required column `passwordHash` to the `AdminUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdminUser" DROP COLUMN "password",
ADD COLUMN     "passwordHash" TEXT NOT NULL;
