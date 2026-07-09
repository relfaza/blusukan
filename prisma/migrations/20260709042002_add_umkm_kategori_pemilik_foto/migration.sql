-- CreateEnum
CREATE TYPE "KategoriUmkm" AS ENUM ('KULINER', 'KERAJINAN', 'FASHION', 'JASA', 'LAINNYA');

-- AlterTable
ALTER TABLE "LocalWarung" ADD COLUMN     "fotoUrl" TEXT,
ADD COLUMN     "kategori" "KategoriUmkm" NOT NULL DEFAULT 'LAINNYA',
ADD COLUMN     "namaPemilik" TEXT;
