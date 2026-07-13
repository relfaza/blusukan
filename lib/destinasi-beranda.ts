import { prisma } from "@/lib/prisma";
import { POPULARITY_WINDOW_MS, pickMajorityCrowdLevel } from "@/lib/popularity";

/**
 * Bentuk destinasi yang dipakai kartu di Beranda maupun hasil rekomendasi AI.
 * Semua field sudah JSON-safe (Decimal Prisma sudah jadi number biasa).
 */
export type DestinationForClient = {
  id: string;
  name: string;
  kabupaten: string;
  kategori: string;
  latitude: number;
  longitude: number;
  routeStatus: string;
  vibeTags: string[];
  photoUrls: string[];
  totalUpvotes: number;
  verifiedReportsCount: number;
  populerMingguIni: boolean;
  rataRataRating: number;
  totalReview: number;
  htmResmi: number;
  jamOperasional: string | null;
  /** Kondisi jalan dari laporan terakhir; null kalau destinasi belum punya laporan. */
  kondisiJalanTerakhir: string | null;
  reports: Array<{
    signalStrength: string | null;
    crowdLevel: string | null;
  }>;
};

/**
 * Sumber tunggal daftar destinasi APPROVED beserta agregat komunitasnya.
 * Dipakai Beranda dan asisten AI, supaya AI mustahil merekomendasikan
 * destinasi di luar daftar ini.
 */
export async function getDestinasiBeranda(): Promise<DestinationForClient[]> {
  const [rows, upvoteSums, verifiedCounts, recentCrowdGroups, reviewAggs] = await Promise.all([
    prisma.destination.findMany({
      where: { status: "APPROVED" },
      include: {
        reports: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            signalStrength: true,
            crowdLevel: true,
            roadCondition: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    // Total upvote per destinasi, dari seluruh laporan (bukan cuma yang terbaru)
    prisma.userReport.groupBy({
      by: ["destinationId"],
      _sum: { upvoteCount: true },
    }),
    // Jumlah laporan terverifikasi per destinasi
    prisma.userReport.groupBy({
      by: ["destinationId"],
      where: { isVerified: true },
      _count: { _all: true },
    }),
    // Sebaran crowdLevel 7 hari terakhir per destinasi, untuk "Populer minggu ini"
    prisma.userReport.groupBy({
      by: ["destinationId", "crowdLevel"],
      where: { createdAt: { gte: new Date(Date.now() - POPULARITY_WINDOW_MS) } },
      _count: { _all: true },
    }),
    // Rata-rata rating & total ulasan per destinasi
    prisma.review.groupBy({
      by: ["destinationId"],
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ]);

  const upvoteMap = new Map(
    upvoteSums.map((u) => [u.destinationId, u._sum.upvoteCount ?? 0])
  );
  const verifiedMap = new Map(
    verifiedCounts.map((v) => [v.destinationId, v._count._all])
  );
  const crowdByDestination = new Map<string, Map<string, number>>();
  for (const g of recentCrowdGroups) {
    if (!crowdByDestination.has(g.destinationId)) {
      crowdByDestination.set(g.destinationId, new Map());
    }
    crowdByDestination.get(g.destinationId)!.set(g.crowdLevel, g._count._all);
  }
  const reviewMap = new Map(
    reviewAggs.map((r) => [r.destinationId, { avg: r._avg.rating ?? 0, count: r._count._all }])
  );

  // Serialize Prisma Decimal → plain number so the client component
  // receives JSON-safe props
  return rows.map((d) => {
    const majorityCrowd = crowdByDestination.has(d.id)
      ? pickMajorityCrowdLevel(crowdByDestination.get(d.id)!.entries())
      : null;
    const laporanTerakhir = d.reports[0];

    return {
      id: d.id,
      name: d.name,
      kabupaten: d.kabupaten,
      kategori: d.kategori,
      latitude: d.latitude,
      longitude: d.longitude,
      routeStatus: d.routeStatus,
      vibeTags: d.vibeTags as string[],
      photoUrls: d.photoUrls as string[],
      totalUpvotes: upvoteMap.get(d.id) ?? 0,
      verifiedReportsCount: verifiedMap.get(d.id) ?? 0,
      populerMingguIni: majorityCrowd === "PADAT",
      rataRataRating: reviewMap.get(d.id)?.avg ?? 0,
      totalReview: reviewMap.get(d.id)?.count ?? 0,
      htmResmi: Number(d.htmResmi),
      jamOperasional: d.jamOperasional,
      kondisiJalanTerakhir: laporanTerakhir?.roadCondition ?? null,
      reports: laporanTerakhir
        ? [{ signalStrength: laporanTerakhir.signalStrength, crowdLevel: laporanTerakhir.crowdLevel }]
        : [],
    };
  });
}
