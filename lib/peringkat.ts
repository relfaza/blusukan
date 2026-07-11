import { prisma } from "@/lib/prisma";

export type PeringkatDestinasi = {
  id: string;
  name: string;
  kabupaten: string;
  jumlahKunjungan: number;
  rataRataRating: number;
  totalReview: number;
};

/** Peringkat keramaian — jumlahKunjungan pakai definisi yang sama dengan app/api/admin/kunjungan (TIKET_MASUK + SELESAI) */
export async function getPeringkatDestinasi(): Promise<PeringkatDestinasi[]> {
  const [destinations, kunjunganGroups, reviewGroups] = await Promise.all([
    prisma.destination.findMany({
      where: { status: "APPROVED" },
      select: { id: true, name: true, kabupaten: true },
    }),
    prisma.transaksi.groupBy({
      by: ["destinationId"],
      where: { type: "TIKET_MASUK", status: "SELESAI" },
      _count: { _all: true },
    }),
    prisma.review.groupBy({
      by: ["destinationId"],
      _count: { _all: true },
      _avg: { rating: true },
    }),
  ]);

  const kunjunganMap = new Map(kunjunganGroups.map((g) => [g.destinationId, g._count._all]));
  const reviewMap = new Map(reviewGroups.map((g) => [g.destinationId, { total: g._count._all, avg: g._avg.rating }]));

  return destinations
    .map((d) => {
      const review = reviewMap.get(d.id);
      return {
        id: d.id,
        name: d.name,
        kabupaten: d.kabupaten,
        jumlahKunjungan: kunjunganMap.get(d.id) ?? 0,
        rataRataRating: review?.avg != null ? Number(review.avg.toFixed(1)) : 0,
        totalReview: review?.total ?? 0,
      };
    })
    .sort((a, b) => b.jumlahKunjungan - a.jumlahKunjungan);
}
