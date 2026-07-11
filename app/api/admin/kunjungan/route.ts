import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const BULAN_LABEL = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

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

/** 12 minggu terakhir (blok 7 hari), label pakai tanggal awal minggu */
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

export async function GET(request: Request) {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { searchParams } = new URL(request.url);
  const periode = searchParams.get("periode") ?? "harian";
  const destinationId = searchParams.get("destinationId") || undefined;

  if (!["harian", "mingguan", "bulanan"].includes(periode)) {
    return NextResponse.json({ message: "Periode tidak valid." }, { status: 400 });
  }

  const now = new Date();
  const buckets =
    periode === "harian" ? buildHarianBuckets(now) : periode === "mingguan" ? buildMingguanBuckets(now) : buildBulananBuckets(now);

  const rangeStart = buckets[0].start;

  const transaksis = await prisma.transaksi.findMany({
    where: {
      type: "TIKET_MASUK",
      status: "SELESAI",
      selesaiAt: { gte: rangeStart, not: null },
      ...(destinationId ? { destinationId } : {}),
    },
    select: { selesaiAt: true },
  });

  const data = buckets.map(({ label, start, end }) => ({
    label,
    jumlahKunjungan: transaksis.filter((t) => t.selesaiAt! >= start && t.selesaiAt! < end).length,
  }));

  const totalKunjungan = data.reduce((sum, d) => sum + d.jumlahKunjungan, 0);

  return NextResponse.json({ periode, data, totalKunjungan });
}
