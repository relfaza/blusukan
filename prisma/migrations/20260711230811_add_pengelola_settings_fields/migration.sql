-- AlterTable
ALTER TABLE "User" ADD COLUMN     "namaUsaha" TEXT,
ADD COLUMN     "notifBookingAktif" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifTransaksiAktif" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifUlasanAktif" BOOLEAN NOT NULL DEFAULT true;
