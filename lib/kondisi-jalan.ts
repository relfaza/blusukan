import { prisma } from "@/lib/prisma";
import type { RouteStatus } from "@/lib/generated/prisma/enums";

/**
 * Kondisi jalan terakhir yang dilaporkan warga per destinasi (dari UserReport, laporan terbaru).
 * Dipakai untuk filter & tampilan "kondisi jalan" berbasis laporan warga, bukan field routeStatus resmi.
 * Key = destinationId, value = roadCondition dari laporan paling baru.
 */
export async function getKondisiJalanTerakhirMap(destinationIds: string[]): Promise<Map<string, RouteStatus>> {
  if (destinationIds.length === 0) return new Map();

  const reports = await prisma.userReport.findMany({
    where: { destinationId: { in: destinationIds } },
    select: { destinationId: true, roadCondition: true },
    orderBy: { createdAt: "desc" },
  });

  const map = new Map<string, RouteStatus>();
  for (const r of reports) {
    if (!map.has(r.destinationId)) map.set(r.destinationId, r.roadCondition);
  }
  return map;
}
