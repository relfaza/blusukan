import { prisma } from "@/lib/prisma";
import BerandaClient, { type DestinationForClient } from "./beranda-client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const rows = await prisma.destination.findMany({
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
  });

  // Serialize Prisma Decimal → plain number so the client component
  // receives JSON-safe props
  const destinations: DestinationForClient[] = rows.map((d) => ({
    id: d.id,
    name: d.name,
    kabupaten: d.kabupaten,
    kategori: d.kategori,
    latitude: d.latitude,
    longitude: d.longitude,
    routeStatus: d.routeStatus,
    vibeTags: d.vibeTags as string[],
    reports: d.reports.map((r) => ({
      signalStrength: r.signalStrength,
      crowdLevel: r.crowdLevel,
    })),
  }));

  return <BerandaClient destinations={destinations} />;
}
