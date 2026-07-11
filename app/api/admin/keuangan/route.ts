import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { buildBucketsForPeriodeKeuangan, type PeriodeKeuangan } from "@/lib/keuanganBuckets";

const TRANSAKSI_SELESAI_STATUS = ["SELESAI", "DIKONFIRMASI"] as const;

export async function GET(request: Request) {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { searchParams } = new URL(request.url);
  const periode = searchParams.get("periode") ?? "harian";
  const destinationId = searchParams.get("destinationId");

  if (!["harian", "mingguan", "bulanan", "tahunan"].includes(periode)) {
    return NextResponse.json({ message: "Periode tidak valid." }, { status: 400 });
  }

  const now = new Date();
  const buckets = buildBucketsForPeriodeKeuangan(periode as PeriodeKeuangan, now);

  const rangeStart = buckets[0].start;

  const transaksis = await prisma.transaksi.findMany({
    where: {
      status: { in: [...TRANSAKSI_SELESAI_STATUS] },
      createdAt: { gte: rangeStart },
      ...(destinationId ? { destinationId } : {}),
    },
    select: {
      totalHarga: true,
      type: true,
      createdAt: true,
      destinationId: true,
      destination: { select: { name: true } },
    },
  });

  const tren = buckets.map(({ label, start, end }) => ({
    label,
    totalPendapatan: transaksis
      .filter((t) => t.createdAt >= start && t.createdAt < end)
      .reduce((sum, t) => sum + Number(t.totalHarga), 0),
  }));

  // Perbandingan periode-over-periode: unit terakhir (mis. bulan ini) vs unit sebelumnya (bulan lalu)
  const totalPeriodeIni = tren[tren.length - 1]?.totalPendapatan ?? 0;
  const totalPeriodeSebelumnya = tren[tren.length - 2]?.totalPendapatan ?? 0;
  const persenPerubahan =
    totalPeriodeSebelumnya === 0
      ? totalPeriodeIni === 0
        ? 0
        : 100
      : Number((((totalPeriodeIni - totalPeriodeSebelumnya) / totalPeriodeSebelumnya) * 100).toFixed(1));

  const perJenisMap = new Map<string, number>();
  for (const t of transaksis) {
    perJenisMap.set(t.type, (perJenisMap.get(t.type) ?? 0) + Number(t.totalHarga));
  }
  const perJenis = Array.from(perJenisMap.entries()).map(([type, totalPendapatan]) => ({ type, totalPendapatan }));

  // Peringkat destinasi tidak relevan saat sudah difilter ke 1 destinasi
  let top5Destinasi: { destinationId: string; name: string; totalPendapatan: number; jumlahTransaksi: number }[] = [];
  if (!destinationId) {
    const perDestinasiMap = new Map<string, { name: string; totalPendapatan: number; jumlahTransaksi: number }>();
    for (const t of transaksis) {
      const existing = perDestinasiMap.get(t.destinationId);
      if (existing) {
        existing.totalPendapatan += Number(t.totalHarga);
        existing.jumlahTransaksi += 1;
      } else {
        perDestinasiMap.set(t.destinationId, {
          name: t.destination.name,
          totalPendapatan: Number(t.totalHarga),
          jumlahTransaksi: 1,
        });
      }
    }
    top5Destinasi = Array.from(perDestinasiMap.entries())
      .map(([id, v]) => ({ destinationId: id, ...v }))
      .sort((a, b) => b.totalPendapatan - a.totalPendapatan)
      .slice(0, 5);
  }

  return NextResponse.json({
    periode,
    tren,
    totalPeriodeIni,
    persenPerubahan,
    perJenis,
    top5Destinasi,
  });
}
