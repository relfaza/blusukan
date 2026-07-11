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
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalDestinasi,
    totalPending,
    totalLaporan,
    transaksiAgg,
    laporanRecent,
    transaksiRecent,
    kategoriGroups,
    kabupatenGroups,
    destinasiBaruBulanIni,
    pendingDestinations,
    laporanMingguIni,
    transaksiMingguIni,
    roadConditionGroups,
    crowdLevelGroups,
    reviewsRecent,
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
    prisma.destination.count({ where: { status: "APPROVED", approvedAt: { gte: startOfMonth } } }),
    prisma.destination.findMany({ where: { status: "PENDING" }, select: { createdAt: true } }),
    prisma.userReport.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.transaksi.count({
      where: { status: { in: [...TRANSAKSI_SELESAI_STATUS] }, createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.userReport.groupBy({ by: ["roadCondition"], _count: { _all: true } }),
    prisma.userReport.groupBy({ by: ["crowdLevel"], _count: { _all: true } }),
    prisma.review.findMany({
      where: { createdAt: { gte: rangeStart } },
      select: { createdAt: true, rating: true },
    }),
  ]);

  const rataRataHariMenunggu =
    pendingDestinations.length === 0
      ? 0
      : Math.round(
          pendingDestinations.reduce((sum, d) => sum + (now.getTime() - d.createdAt.getTime()) / 86400000, 0) /
            pendingDestinations.length
        );

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

  const trenRatingRataRata = months.map(({ bulan, year, month }) => {
    const ratings = reviewsRecent.filter(
      (r) => r.createdAt.getFullYear() === year && r.createdAt.getMonth() === month
    );
    const rataRata = ratings.length === 0 ? 0 : ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    return { bulan, rataRata: Number(rataRata.toFixed(1)) };
  });

  return NextResponse.json({
    totalDestinasi,
    totalPending,
    totalLaporan,
    totalTransaksi: transaksiAgg._count._all,
    totalPendapatanEstimasi: Number(transaksiAgg._sum.totalHarga ?? 0),
    destinasiBaruBulanIni,
    rataRataHariMenunggu,
    laporanMingguIni,
    transaksiMingguIni,
    laporanPerBulan,
    transaksiPerBulan,
    destinasiPerKategori: kategoriGroups.map((g) => ({ kategori: g.kategori, jumlah: g._count._all })),
    destinasiPerKabupaten: kabupatenGroups.map((g) => ({ kabupaten: g.kabupaten, jumlah: g._count._all })),
    distribusiKondisiJalan: roadConditionGroups.map((g) => ({ kondisi: g.roadCondition, jumlah: g._count._all })),
    distribusiKeramaian: crowdLevelGroups.map((g) => ({ keramaian: g.crowdLevel, jumlah: g._count._all })),
    trenRatingRataRata,
  });
}
