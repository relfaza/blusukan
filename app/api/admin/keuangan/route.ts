import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const BULAN_LABEL = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const TRANSAKSI_SELESAI_STATUS = ["SELESAI", "DIKONFIRMASI"] as const;

type Bucket = { label: string; start: Date; end: Date };

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** 30 hari terakhir, per tanggal */
function buildHarianBuckets(now: Date): Bucket[] {
  const today = startOfDay(now);
  const buckets: Bucket[] = [];
  for (let i = 29; i >= 0; i--) {
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
    buckets.push({ label: `${start.getDate()} ${BULAN_LABEL[start.getMonth()]}`, start, end });
  }
  return buckets;
}

/** 12 minggu terakhir (blok 7 hari) */
function buildMingguanBuckets(now: Date): Bucket[] {
  const today = startOfDay(now);
  const buckets: Bucket[] = [];
  for (let i = 11; i >= 0; i--) {
    const weekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i * 7);
    const weekStart = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate() - 6);
    const end = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate() + 1);
    buckets.push({
      label: `Minggu ${weekStart.getDate()} ${BULAN_LABEL[weekStart.getMonth()]}`,
      start: weekStart,
      end,
    });
  }
  return buckets;
}

/** 12 bulan terakhir, per bulan kalender */
function buildBulananBuckets(now: Date): Bucket[] {
  const buckets: Bucket[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    buckets.push({ label: `${BULAN_LABEL[d.getMonth()]} ${d.getFullYear()}`, start, end });
  }
  return buckets;
}

/** 5 tahun terakhir, per tahun kalender */
function buildTahunanBuckets(now: Date): Bucket[] {
  const buckets: Bucket[] = [];
  for (let i = 4; i >= 0; i--) {
    const year = now.getFullYear() - i;
    buckets.push({ label: String(year), start: new Date(year, 0, 1), end: new Date(year + 1, 0, 1) });
  }
  return buckets;
}

export async function GET(request: Request) {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { searchParams } = new URL(request.url);
  const periode = searchParams.get("periode") ?? "harian";

  if (!["harian", "mingguan", "bulanan", "tahunan"].includes(periode)) {
    return NextResponse.json({ message: "Periode tidak valid." }, { status: 400 });
  }

  const now = new Date();
  const buckets =
    periode === "harian"
      ? buildHarianBuckets(now)
      : periode === "mingguan"
        ? buildMingguanBuckets(now)
        : periode === "bulanan"
          ? buildBulananBuckets(now)
          : buildTahunanBuckets(now);

  const rangeStart = buckets[0].start;

  const transaksis = await prisma.transaksi.findMany({
    where: {
      status: { in: [...TRANSAKSI_SELESAI_STATUS] },
      createdAt: { gte: rangeStart },
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
  const top5Destinasi = Array.from(perDestinasiMap.entries())
    .map(([destinationId, v]) => ({ destinationId, ...v }))
    .sort((a, b) => b.totalPendapatan - a.totalPendapatan)
    .slice(0, 5);

  return NextResponse.json({
    periode,
    tren,
    totalPeriodeIni,
    persenPerubahan,
    perJenis,
    top5Destinasi,
  });
}
