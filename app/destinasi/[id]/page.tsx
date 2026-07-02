import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { POPULARITY_WINDOW_MS, pickMajorityCrowdLevel } from "@/lib/popularity";
import DestinasiDetailClient from "./DestinasiDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DestinasiDetailPage({ params }: Props) {
  const { id } = await params;

  const [raw, upvoteAgg, verifiedReportsCount, recentCrowdGroups] = await Promise.all([
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
    htmResmi: raw.htmResmi ? Number(raw.htmResmi) : null,
    hasToilet: raw.hasToilet,
    hasParkir: raw.hasParkir,
    hasTempatIbadah: raw.hasTempatIbadah,
    hasTempatDuduk: raw.hasTempatDuduk,
    hasPenitipanBarang: raw.hasPenitipanBarang,
    vibeTags: raw.vibeTags as string[],
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
      menuItems: w.menuItems.map((m) => ({
        id: m.id,
        name: m.name,
        price: Number(m.price),
      })),
    })),
  };

  return <DestinasiDetailClient destination={destination} />;
}
