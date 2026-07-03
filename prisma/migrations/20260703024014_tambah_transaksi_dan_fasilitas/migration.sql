-- CreateEnum
CREATE TYPE "TransaksiType" AS ENUM ('TIKET_MASUK', 'FASILITAS');

-- CreateEnum
CREATE TYPE "TransaksiStatus" AS ENUM ('PENDING', 'DIKONFIRMASI', 'SELESAI', 'DIBATALKAN');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'TRANSFER_MANUAL');

-- CreateTable
CREATE TABLE "Transaksi" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "type" "TransaksiType" NOT NULL,
    "totalHarga" DECIMAL(65,30) NOT NULL,
    "status" "TransaksiStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'COD',
    "jadwal" TIMESTAMP(3),
    "catatan" TEXT,
    "kodeTransaksi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransaksiItem" (
    "id" TEXT NOT NULL,
    "transaksiId" TEXT NOT NULL,
    "namaItem" TEXT NOT NULL,
    "hargaSatuan" DECIMAL(65,30) NOT NULL,
    "kuantitas" INTEGER NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "TransaksiItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fasilitas" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "hargaSewa" DECIMAL(65,30) NOT NULL,
    "satuanWaktu" TEXT NOT NULL DEFAULT 'per jam',
    "jumlahUnit" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Fasilitas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaksi_kodeTransaksi_key" ON "Transaksi"("kodeTransaksi");

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiItem" ADD CONSTRAINT "TransaksiItem_transaksiId_fkey" FOREIGN KEY ("transaksiId") REFERENCES "Transaksi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fasilitas" ADD CONSTRAINT "Fasilitas_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
