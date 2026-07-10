-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bahasaPreferensi" TEXT NOT NULL DEFAULT 'id',
ADD COLUMN     "namaInstansi" TEXT,
ADD COLUMN     "notifEmailAktif" BOOLEAN NOT NULL DEFAULT true;
