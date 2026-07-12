import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { POPULARITY_WINDOW_MS, pickMajorityCrowdLevel } from "@/lib/popularity";
import DestinasiDetailClient from "./DestinasiDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DestinasiDetailPage({ params }: Props) {
  const { id } = await params;

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const [
    raw,
    upvoteAgg,
    verifiedReportsCount,
    recentCrowdGroups,
    fasilitasList,
    reviews,
    reviewAgg,
    myReview,
    userProfile,
  ] = await Promise.all([
    prisma.destination.findFirst({
      where: { id, status: "APPROVED" },
      include: {
        reports: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            user: { select: { name: true } },
          },
        },
        localServices: {
          where: { isValidated: true },
        },
        warungs: {
          include: { menuItems: true },
        },
      },
    }),
    // Total upvote dari seluruh laporan destinasi ini (bukan cuma yang terbaru)
    prisma.userReport.aggregate({
      where: { destinationId: id },
      _sum: { upvoteCount: true },
    }),
    // Jumlah laporan terverifikasi
    prisma.userReport.count({ where: { destinationId: id, isVerified: true } }),
    // Sebaran crowdLevel 7 hari terakhir, untuk "Populer minggu ini"
    prisma.userReport.groupBy({
      by: ["crowdLevel"],
      where: { destinationId: id, createdAt: { gte: new Date(Date.now() - POPULARITY_WINDOW_MS) } },
      _count: { _all: true },
    }),
    // Fasilitas yang bisa disewa untuk destinasi ini
    prisma.fasilitas.findMany({ where: { destinationId: id }, orderBy: { nama: "asc" } }),
    // Ulasan wisatawan untuk destinasi ini
    prisma.review.findMany({
      where: { destinationId: id },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    // Rata-rata rating & total ulasan
    prisma.review.aggregate({
      where: { destinationId: id },
      _avg: { rating: true },
      _count: { _all: true },
    }),
    // Review milik user yang sedang login (kalau ada) — untuk prefill form edit
    userId
      ? prisma.review.findUnique({
          where: { userId_destinationId: { userId, destinationId: id } },
        })
      : Promise.resolve(null),
    // Nomor telepon user (untuk prefill nomor kontak form booking transport)
    userId
      ? prisma.user.findUnique({ where: { id: userId }, select: { phone: true } })
      : Promise.resolve(null),
  ]);

  if (!raw) notFound();

  const totalUpvotes = upvoteAgg._sum.upvoteCount ?? 0;
  const majorityCrowd = pickMajorityCrowdLevel(
    recentCrowdGroups.map((g) => [g.crowdLevel, g._count._all] as [string, number])
  );
  const populerMingguIni = majorityCrowd === "PADAT";

  // Serialize semua Decimal → number (JSON-safe)
  const destination = {
    id: raw.id,
    name: raw.name,
    kabupaten: raw.kabupaten,
    kategori: raw.kategori,
    latitude: raw.latitude,
    longitude: raw.longitude,
    routeStatus: raw.routeStatus,
    jamOperasional: raw.jamOperasional,
    jamBuka: raw.jamBuka,
    jamTutup: raw.jamTutup,
    buka24Jam: raw.buka24Jam,
    htmResmi: raw.htmResmi ? Number(raw.htmResmi) : null,
    htmAnak: raw.htmAnak ? Number(raw.htmAnak) : null,
    hasToilet: raw.hasToilet,
    hasParkir: raw.hasParkir,
    hasTempatIbadah: raw.hasTempatIbadah,
    hasTempatDuduk: raw.hasTempatDuduk,
    hasPenitipanBarang: raw.hasPenitipanBarang,
    vibeTags: raw.vibeTags as string[],
    photoUrls: raw.photoUrls as string[],
    totalUpvotes,
    verifiedReportsCount,
    populerMingguIni,
    reports: raw.reports.map((r) => ({
      id: r.id,
      userName: r.user?.name ?? "Anonim",
      roadCondition: r.roadCondition,
      signalStrength: r.signalStrength,
      crowdLevel: r.crowdLevel,
      reportedFee: r.reportedFee ? Number(r.reportedFee) : null,
      notes: r.notes,
      createdAt: r.createdAt.toISOString(),
    })),
    localServices: raw.localServices.map((s) => ({
      id: s.id,
      providerName: s.providerName,
      serviceType: s.serviceType,
      contactWa: s.contactWa,
      baseRate: s.baseRate ? Number(s.baseRate) : null,
    })),
    warungs: raw.warungs.map((w) => ({
      id: w.id,
      name: w.name,
      location: w.location,
      kategori: w.kategori,
      namaPemilik: w.namaPemilik,
      photoUrls: w.photoUrls,
      bisaBooking: w.bisaBooking,
      menuItems: w.menuItems.map((m) => ({
        id: m.id,
        name: m.name,
        price: Number(m.price),
      })),
    })),
    fasilitas: fasilitasList.map((f) => ({
      id: f.id,
      nama: f.nama,
      hargaSewa: Number(f.hargaSewa),
      satuanWaktu: f.satuanWaktu,
      jumlahUnit: f.jumlahUnit,
      lokasiDalamDestinasi: f.lokasiDalamDestinasi,
      deskripsiManfaat: f.deskripsiManfaat,
      fotoUrl: f.fotoUrl,
    })),
    reviews: reviews.map((r) => ({
      id: r.id,
      userName: r.user.name,
      rating: r.rating,
      komentar: r.komentar,
      createdAt: r.createdAt.toISOString(),
    })),
    rataRataRating: reviewAgg._avg.rating ?? 0,
    totalReview: reviewAgg._count._all,
    isLoggedIn: Boolean(userId),
    myReview: myReview ? { rating: myReview.rating, komentar: myReview.komentar } : null,
    userPhone: userProfile?.phone ?? null,
  };

  return <DestinasiDetailClient destination={destination} />;
}
