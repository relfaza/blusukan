import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const BULAN_LABEL = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function buildHarianBuckets(now: Date) {
  const today = startOfDay(now);
  const buckets = [];
  for (let i = 29; i >= 0; i--) {
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
    buckets.push({
      tanggal: `${start.getDate()} ${BULAN_LABEL[start.getMonth()]} ${start.getFullYear()}`,
      start,
      end,
    });
  }
  return buckets;
}

export async function GET() {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const now = new Date();
  const buckets = buildHarianBuckets(now);
  const rangeStart = buckets[0].start;

  const [pendingRecent, kabupatenGroups, kategoriGroups, totalPending, oldestPending, newestPending] = await Promise.all([
    prisma.destination.findMany({
      where: { status: "PENDING", createdAt: { gte: rangeStart } },
      select: { createdAt: true },
    }),
    prisma.destination.groupBy({
      by: ["kabupaten"],
      where: { status: "PENDING" },
      _count: { _all: true },
    }),
    prisma.destination.groupBy({
      by: ["kategori"],
      where: { status: "PENDING" },
      _count: { _all: true },
    }),
    prisma.destination.count({ where: { status: "PENDING" } }),
    prisma.destination.findFirst({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, createdAt: true },
    }),
    prisma.destination.findFirst({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, createdAt: true },
    }),
  ]);

  const perTanggal = buckets.map(({ tanggal, start, end }) => ({
    tanggal,
    jumlah: pendingRecent.filter((d) => d.createdAt >= start && d.createdAt < end).length,
  }));

  const hariSejak = (createdAt: Date) => Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

  return NextResponse.json({
    perTanggal,
    perKabupaten: kabupatenGroups.map((g) => ({ kabupaten: g.kabupaten, jumlah: g._count._all })),
    perKategori: kategoriGroups.map((g) => ({ kategori: g.kategori, jumlah: g._count._all })),
    totalPending,
    destinasiTerlama: oldestPending
      ? { id: oldestPending.id, name: oldestPending.name, hari: hariSejak(oldestPending.createdAt) }
      : null,
    destinasiTerbaru: newestPending
      ? { id: newestPending.id, name: newestPending.name, hari: hariSejak(newestPending.createdAt) }
      : null,
  });
}
