-- AlterTable
ALTER TABLE "Destination" ADD COLUMN     "buka24Jam" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jamBuka" TEXT,
ADD COLUMN     "jamTutup" TEXT;
