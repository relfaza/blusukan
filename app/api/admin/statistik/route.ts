import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const BULAN_LABEL = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const TRANSAKSI_SELESAI_STATUS = ["SELESAI", "DIKONFIRMASI"] as const;

function last6Months(): { bulan: string; year: number; month: number }[] {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      bulan: `${BULAN_LABEL[d.getMonth()]} ${d.getFullYear()}`,
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return months;
}

export async function GET() {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const months = last6Months();
  const rangeStart = new Date(months[0].year, months[0].month, 1);

  const [
    totalDestinasi,
    totalPending,
    totalLaporan,
    transaksiAgg,
    laporanRecent,
    transaksiRecent,
    kategoriGroups,
    kabupatenGroups,
  ] = await Promise.all([
    prisma.destination.count({ where: { status: "APPROVED" } }),
    prisma.destination.count({ where: { status: "PENDING" } }),
    prisma.userReport.count(),
    prisma.transaksi.aggregate({
      where: { status: { in: [...TRANSAKSI_SELESAI_STATUS] } },
      _sum: { totalHarga: true },
      _count: { _all: true },
    }),
    prisma.userReport.findMany({
      where: { createdAt: { gte: rangeStart } },
      select: { createdAt: true },
    }),
    prisma.transaksi.findMany({
      where: { createdAt: { gte: rangeStart }, status: { in: [...TRANSAKSI_SELESAI_STATUS] } },
      select: { createdAt: true, totalHarga: true },
    }),
    prisma.destination.groupBy({
      by: ["kategori"],
      where: { status: "APPROVED" },
      _count: { _all: true },
    }),
    prisma.destination.groupBy({
      by: ["kabupaten"],
      where: { status: "APPROVED" },
      _count: { _all: true },
    }),
  ]);

  const laporanPerBulan = months.map(({ bulan, year, month }) => ({
    bulan,
    jumlah: laporanRecent.filter((r) => r.createdAt.getFullYear() === year && r.createdAt.getMonth() === month)
      .length,
  }));

  const transaksiPerBulan = months.map(({ bulan, year, month }) => ({
    bulan,
    jumlah: transaksiRecent
      .filter((t) => t.createdAt.getFullYear() === year && t.createdAt.getMonth() === month)
      .reduce((sum, t) => sum + Number(t.totalHarga), 0),
  }));

  return NextResponse.json({
    totalDestinasi,
    totalPending,
    totalLaporan,
    totalTransaksi: transaksiAgg._count._all,
    totalPendapatanEstimasi: Number(transaksiAgg._sum.totalHarga ?? 0),
    laporanPerBulan,
    transaksiPerBulan,
    destinasiPerKategori: kategoriGroups.map((g) => ({ kategori: g.kategori, jumlah: g._count._all })),
    destinasiPerKabupaten: kabupatenGroups.map((g) => ({ kabupaten: g.kabupaten, jumlah: g._count._all })),
  });
}
