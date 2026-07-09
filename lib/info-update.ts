import { prisma } from "@/lib/prisma";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export type HiddenGemDestinasi = {
  id: string;
  name: string;
  kabupaten: string;
  kategori: string;
  photoUrls: string[];
  approvedAt: string;
};

export type PopulerDestinasi = {
  id: string;
  name: string;
  kabupaten: string;
  kategori: string;
  photoUrls: string[];
  reviewCountMinggu: number;
  transaksiCountMinggu: number;
  rataRataRating: number;
  skor: number;
};

/** Destinasi yang baru saja disetujui Admin, terbaru duluan. */
export async function getHiddenGemBaru(limit = 6): Promise<HiddenGemDestinasi[]> {
  const destinations = await prisma.destination.findMany({
    where: { status: "APPROVED", approvedAt: { not: null } },
    orderBy: { approvedAt: "desc" },
    take: limit,
    select: { id: true, name: true, kabupaten: true, kategori: true, photoUrls: true, approvedAt: true },
  });

  return destinations.map((d) => ({
    id: d.id,
    name: d.name,
    kabupaten: d.kabupaten,
    kategori: d.kategori,
    photoUrls: d.photoUrls,
    approvedAt: d.approvedAt!.toISOString(),
  }));
}

/** Destinasi dengan aktivitas (ulasan + transaksi) terbanyak dalam 7 hari terakhir. */
export async function getPopulerMingguIni(limit = 6): Promise<PopulerDestinasi[]> {
  const sejakTanggal = new Date(Date.now() - SEVEN_DAYS_MS);

  const [reviewGroups, transaksiGroups] = await Promise.all([
    prisma.review.groupBy({
      by: ["destinationId"],
      where: { createdAt: { gte: sejakTanggal } },
      _count: { _all: true },
    }),
    prisma.transaksi.groupBy({
      by: ["destinationId"],
      where: { createdAt: { gte: sejakTanggal } },
      _count: { _all: true },
    }),
  ]);

  const reviewCountMap = new Map(reviewGroups.map((g) => [g.destinationId, g._count._all]));
  const transaksiCountMap = new Map(transaksiGroups.map((g) => [g.destinationId, g._count._all]));
  const destinationIds = new Set([...reviewCountMap.keys(), ...transaksiCountMap.keys()]);

  const scored = Array.from(destinationIds)
    .map((destinationId) => {
      const reviewCountMinggu = reviewCountMap.get(destinationId) ?? 0;
      const transaksiCountMinggu = transaksiCountMap.get(destinationId) ?? 0;
      return {
        destinationId,
        reviewCountMinggu,
        transaksiCountMinggu,
        skor: reviewCountMinggu + transaksiCountMinggu,
      };
    })
    .filter((s) => s.skor > 0)
    .sort((a, b) => b.skor - a.skor)
    .slice(0, limit);

  if (scored.length === 0) return [];

  const topIds = scored.map((s) => s.destinationId);

  const [destinations, ratingGroups] = await Promise.all([
    prisma.destination.findMany({
      where: { id: { in: topIds }, status: "APPROVED" },
      select: { id: true, name: true, kabupaten: true, kategori: true, photoUrls: true },
    }),
    prisma.review.groupBy({
      by: ["destinationId"],
      where: { destinationId: { in: topIds } },
      _avg: { rating: true },
    }),
  ]);

  const destinationMap = new Map(destinations.map((d) => [d.id, d]));
  const ratingMap = new Map(ratingGroups.map((g) => [g.destinationId, g._avg.rating ?? 0]));

  return scored
    .map((s) => {
      const dest = destinationMap.get(s.destinationId);
      if (!dest) return null;
      const result: PopulerDestinasi = {
        id: dest.id,
        name: dest.name,
        kabupaten: dest.kabupaten,
        kategori: dest.kategori,
        photoUrls: dest.photoUrls,
        reviewCountMinggu: s.reviewCountMinggu,
        transaksiCountMinggu: s.transaksiCountMinggu,
        rataRataRating: ratingMap.get(s.destinationId) ?? 0,
        skor: s.skor,
      };
      return result;
    })
    .filter((d): d is PopulerDestinasi => d !== null);
}
