-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notifLainnyaAktif" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifStatusBookingAktif" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifStatusTransaksiAktif" BOOLEAN NOT NULL DEFAULT true;
