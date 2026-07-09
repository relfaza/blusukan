/*
  Warnings:

  - You are about to drop the column `fotoUrl` on the `LocalWarung` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LocalWarung" DROP COLUMN "fotoUrl",
ADD COLUMN     "bisaBooking" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "photoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
