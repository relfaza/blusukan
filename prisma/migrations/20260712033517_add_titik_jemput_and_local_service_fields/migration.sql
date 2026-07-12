-- AlterTable
ALTER TABLE "LocalService" ADD COLUMN     "fotoUrl" TEXT,
ADD COLUMN     "kapasitasPenumpang" INTEGER;

-- CreateTable
CREATE TABLE "TitikJemput" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "namaLokasi" TEXT NOT NULL,
    "hargaTambahan" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "estimasiWaktu" TEXT,

    CONSTRAINT "TitikJemput_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TitikJemput" ADD CONSTRAINT "TitikJemput_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "LocalService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
