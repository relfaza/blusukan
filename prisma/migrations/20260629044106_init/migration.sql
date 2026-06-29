-- CreateEnum
CREATE TYPE "Role" AS ENUM ('WISATAWAN', 'PENGELOLA', 'ADMIN');

-- CreateEnum
CREATE TYPE "Kabupaten" AS ENUM ('SLEMAN', 'GUNUNGKIDUL', 'BANTUL', 'KULON_PROGO', 'KOTA_YOGYAKARTA');

-- CreateEnum
CREATE TYPE "Kategori" AS ENUM ('PANTAI', 'AIR_TERJUN', 'GUNUNG', 'BUKIT', 'TEBING');

-- CreateEnum
CREATE TYPE "DestinationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RouteStatus" AS ENUM ('MUDAH', 'SEDANG', 'SULIT', 'RUSAK', 'BELUM_ADA_DATA');

-- CreateEnum
CREATE TYPE "SignalStrength" AS ENUM ('LEMAH', 'SEDANG', 'KUAT');

-- CreateEnum
CREATE TYPE "CrowdLevel" AS ENUM ('SEPI', 'SEDANG', 'PADAT');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('OJEK', 'JEEP', 'GUIDE');

-- CreateEnum
CREATE TYPE "VibeTag" AS ENUM ('SUNSET', 'SUNRISE', 'SPOT_FOTO', 'QUIET_PLACE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "nikEncrypted" TEXT,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kabupaten" "Kabupaten" NOT NULL,
    "kategori" "Kategori" NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "jamOperasional" TEXT,
    "htmResmi" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "hasToilet" BOOLEAN NOT NULL DEFAULT false,
    "hasParkir" BOOLEAN NOT NULL DEFAULT false,
    "hasTempatIbadah" BOOLEAN NOT NULL DEFAULT false,
    "hasTempatDuduk" BOOLEAN NOT NULL DEFAULT false,
    "hasPenitipanBarang" BOOLEAN NOT NULL DEFAULT false,
    "aksesibilitas" TEXT,
    "vibeTags" "VibeTag"[],
    "routeStatus" "RouteStatus" NOT NULL DEFAULT 'BELUM_ADA_DATA',
    "status" "DestinationStatus" NOT NULL DEFAULT 'PENDING',
    "submittedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalService" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "contactWa" TEXT NOT NULL,
    "baseRate" DECIMAL(65,30) NOT NULL,
    "isValidated" BOOLEAN NOT NULL DEFAULT false,
    "validatedById" TEXT,

    CONSTRAINT "LocalService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "roadCondition" "RouteStatus" NOT NULL,
    "signalStrength" "SignalStrength" NOT NULL,
    "toiletLayak" BOOLEAN,
    "parkirLayak" BOOLEAN,
    "tempatIbadahLayak" BOOLEAN,
    "tempatDudukLayak" BOOLEAN,
    "penitipanBarangLayak" BOOLEAN,
    "reportedFee" DECIMAL(65,30),
    "crowdLevel" "CrowdLevel" NOT NULL,
    "photoUrl" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "upvoteCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalWarung" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalWarung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "warungId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitStat" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "visitorCount" INTEGER NOT NULL DEFAULT 0,
    "peakHour" INTEGER,
    "crowdLevel" "CrowdLevel",

    CONSTRAINT "VisitStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "travelDate" TIMESTAMP(3) NOT NULL,
    "meetingPoint" TEXT,
    "notes" TEXT,
    "contactNumber" TEXT NOT NULL,
    "estimatedArrivalTime" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VisitStat_destinationId_date_key" ON "VisitStat"("destinationId", "date");

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalService" ADD CONSTRAINT "LocalService_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalService" ADD CONSTRAINT "LocalService_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReport" ADD CONSTRAINT "UserReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReport" ADD CONSTRAINT "UserReport_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalWarung" ADD CONSTRAINT "LocalWarung_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_warungId_fkey" FOREIGN KEY ("warungId") REFERENCES "LocalWarung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitStat" ADD CONSTRAINT "VisitStat_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "LocalService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
