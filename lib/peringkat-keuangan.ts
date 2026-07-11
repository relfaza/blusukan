import { prisma } from "@/lib/prisma";

const TRANSAKSI_SELESAI_STATUS = ["SELESAI", "DIKONFIRMASI"] as const;

export type PeringkatKeuangan = {
  id: string;
  name: string;
  kabupaten: string;
  kategori: string;
  submittedByName: string;
  totalPendapatan: number;
  jumlahTransaksi: number;
};

/** Destinasi APPROVED, total pendapatan all-time dari Transaksi SELESAI/DIKONFIRMASI, urut descending */
export async function getPeringkatKeuangan(): Promise<PeringkatKeuangan[]> {
  const [destinations, transaksiGroups] = await Promise.all([
    prisma.destination.findMany({
      where: { status: "APPROVED" },
      select: { id: true, name: true, kabupaten: true, kategori: true, submittedBy: { select: { name: true } } },
    }),
    prisma.transaksi.groupBy({
      by: ["destinationId"],
      where: { status: { in: [...TRANSAKSI_SELESAI_STATUS] } },
      _sum: { totalHarga: true },
      _count: { _all: true },
    }),
  ]);

  const transaksiMap = new Map(
    transaksiGroups.map((g) => [g.destinationId, { total: Number(g._sum.totalHarga ?? 0), jumlah: g._count._all }])
  );

  return destinations
    .map((d) => {
      const t = transaksiMap.get(d.id);
      return {
        id: d.id,
        name: d.name,
        kabupaten: d.kabupaten,
        kategori: d.kategori,
        submittedByName: d.submittedBy.name,
        totalPendapatan: t?.total ?? 0,
        jumlahTransaksi: t?.jumlah ?? 0,
      };
    })
    .sort((a, b) => b.totalPendapatan - a.totalPendapatan);
}
