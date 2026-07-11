import { prisma } from "@/lib/prisma";

export type DestinasiDenganLaporan = {
  id: string;
  name: string;
  kabupaten: string;
  jumlahLaporan: number;
  breakdownKondisiJalan: Record<string, number>;
};

/** Destinasi yang punya minimal 1 UserReport, urut jumlahLaporan terbanyak */
export async function getDestinasiDenganLaporan(): Promise<DestinasiDenganLaporan[]> {
  const destinations = await prisma.destination.findMany({
    where: { reports: { some: {} } },
    select: {
      id: true,
      name: true,
      kabupaten: true,
      reports: { select: { roadCondition: true } },
    },
  });

  return destinations
    .map((d) => {
      const breakdownKondisiJalan: Record<string, number> = {};
      for (const r of d.reports) {
        breakdownKondisiJalan[r.roadCondition] = (breakdownKondisiJalan[r.roadCondition] ?? 0) + 1;
      }
      return {
        id: d.id,
        name: d.name,
        kabupaten: d.kabupaten,
        jumlahLaporan: d.reports.length,
        breakdownKondisiJalan,
      };
    })
    .sort((a, b) => b.jumlahLaporan - a.jumlahLaporan);
}

export type LaporanDetail = {
  id: string;
  userName: string;
  roadCondition: string;
  signalStrength: string;
  crowdLevel: string;
  toiletLayak: boolean | null;
  parkirLayak: boolean | null;
  tempatIbadahLayak: boolean | null;
  tempatDudukLayak: boolean | null;
  penitipanBarangLayak: boolean | null;
  reportedFee: number | null;
  photoUrl: string | null;
  notes: string | null;
  createdAt: string;
};

/** Semua UserReport untuk 1 destinasi, urut createdAt desc */
export async function getLaporanByDestinasi(destinationId: string): Promise<LaporanDetail[]> {
  const reports = await prisma.userReport.findMany({
    where: { destinationId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  return reports.map((r) => ({
    id: r.id,
    userName: r.user.name,
    roadCondition: r.roadCondition,
    signalStrength: r.signalStrength,
    crowdLevel: r.crowdLevel,
    toiletLayak: r.toiletLayak,
    parkirLayak: r.parkirLayak,
    tempatIbadahLayak: r.tempatIbadahLayak,
    tempatDudukLayak: r.tempatDudukLayak,
    penitipanBarangLayak: r.penitipanBarangLayak,
    reportedFee: r.reportedFee != null ? Number(r.reportedFee) : null,
    photoUrl: r.photoUrl,
    notes: r.notes,
    createdAt: r.createdAt.toISOString(),
  }));
}

export type LaporanDistribusi = {
  roadCondition: { kondisi: string; jumlah: number }[];
  signalStrength: { kondisi: string; jumlah: number }[];
  crowdLevel: { kondisi: string; jumlah: number }[];
};

function countBy(reports: LaporanDetail[], key: "roadCondition" | "signalStrength" | "crowdLevel") {
  const counts: Record<string, number> = {};
  for (const r of reports) counts[r[key]] = (counts[r[key]] ?? 0) + 1;
  return Object.entries(counts).map(([kondisi, jumlah]) => ({ kondisi, jumlah }));
}

/** Distribusi roadCondition/signalStrength/crowdLevel untuk 1 destinasi, dari laporan yang sudah dimuat */
export function computeLaporanDistribusi(reports: LaporanDetail[]): LaporanDistribusi {
  return {
    roadCondition: countBy(reports, "roadCondition"),
    signalStrength: countBy(reports, "signalStrength"),
    crowdLevel: countBy(reports, "crowdLevel"),
  };
}
