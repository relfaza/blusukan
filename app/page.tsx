import { prisma } from "@/lib/prisma";
import { POPULARITY_WINDOW_MS, pickMajorityCrowdLevel } from "@/lib/popularity";
import BerandaClient, { type DestinationForClient } from "./beranda-client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [rows, upvoteSums, verifiedCounts, recentCrowdGroups] = await Promise.all([
    prisma.destination.findMany({
      where: { status: "APPROVED" },
      include: {
        reports: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            signalStrength: true,
            crowdLevel: true,
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

  // Serialize Prisma Decimal → plain number so the client component
  // receives JSON-safe props
  const destinations: DestinationForClient[] = rows.map((d) => {
    const majorityCrowd = crowdByDestination.has(d.id)
      ? pickMajorityCrowdLevel(crowdByDestination.get(d.id)!.entries())
      : null;

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
      reports: d.reports.map((r) => ({
        signalStrength: r.signalStrength,
        crowdLevel: r.crowdLevel,
      })),
    };
  });

  return <BerandaClient destinations={destinations} />;
}
