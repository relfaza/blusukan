import { prisma } from "@/lib/prisma";

export type PeringkatRating = {
  id: string;
  name: string;
  kabupaten: string;
  rataRataRating: number;
  totalReview: number;
};

/** Destinasi APPROVED dengan minimal 1 review, urut rataRataRating descending */
export async function getPeringkatRating(): Promise<PeringkatRating[]> {
  const [destinations, reviewGroups] = await Promise.all([
    prisma.destination.findMany({
      where: { status: "APPROVED" },
      select: { id: true, name: true, kabupaten: true },
    }),
    prisma.review.groupBy({
      by: ["destinationId"],
      _count: { _all: true },
      _avg: { rating: true },
    }),
  ]);

  const reviewMap = new Map(reviewGroups.map((g) => [g.destinationId, { total: g._count._all, avg: g._avg.rating }]));

  return destinations
    .map((d) => {
      const review = reviewMap.get(d.id);
      return {
        id: d.id,
        name: d.name,
        kabupaten: d.kabupaten,
        rataRataRating: review?.avg != null ? Number(review.avg.toFixed(1)) : 0,
        totalReview: review?.total ?? 0,
      };
    })
    .filter((d) => d.totalReview > 0)
    .sort((a, b) => b.rataRataRating - a.rataRataRating);
}
