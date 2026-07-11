import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { buildBucketsForPeriodeKeuangan, type PeriodeKeuangan } from "@/lib/keuanganBuckets";
import type { TransaksiType } from "@/lib/generated/prisma/enums";

const TRANSAKSI_SELESAI_STATUS = ["SELESAI", "DIKONFIRMASI"] as const;
const VALID_PERIODE = ["harian", "mingguan", "bulanan", "tahunan"];
const VALID_JENIS = ["TIKET_MASUK", "FASILITAS", "UMKM"];
const MAX_ROWS = 50;

export async function GET(request: Request) {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const periode = searchParams.get("periode") ?? "harian";
  const destinationId = searchParams.get("destinationId") || undefined;

  if (!VALID_PERIODE.includes(periode)) {
    return NextResponse.json({ message: "Periode tidak valid." }, { status: 400 });
  }

  const now = new Date();
  const buckets = buildBucketsForPeriodeKeuangan(periode as PeriodeKeuangan, now);

  switch (type) {
    case "bucket": {
      const label = searchParams.get("label") ?? "";
      const bucket = buckets.find((b) => b.label === label);
      if (!bucket) return NextResponse.json({ message: "Label tidak ditemukan." }, { status: 400 });

      const transaksis = await prisma.transaksi.findMany({
        where: {
          status: { in: [...TRANSAKSI_SELESAI_STATUS] },
          createdAt: { gte: bucket.start, lt: bucket.end },
          ...(destinationId ? { destinationId } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: MAX_ROWS,
        include: { destination: { select: { name: true } }, user: { select: { name: true } } },
      });

      return NextResponse.json({
        rows: transaksis.map((t) => ({
          kodeTransaksi: t.kodeTransaksi,
          destinationName: t.destination.name,
          userName: t.user.name,
          type: t.type,
          totalHarga: Number(t.totalHarga),
          status: t.status,
          createdAt: t.createdAt.toISOString(),
        })),
      });
    }

    case "jenis": {
      const jenis = searchParams.get("jenis") ?? "";
      if (!VALID_JENIS.includes(jenis)) {
        return NextResponse.json({ message: "Parameter jenis tidak valid." }, { status: 400 });
      }
      const rangeStart = buckets[0].start;

      const transaksis = await prisma.transaksi.findMany({
        where: {
          status: { in: [...TRANSAKSI_SELESAI_STATUS] },
          type: jenis as TransaksiType,
          createdAt: { gte: rangeStart },
          ...(destinationId ? { destinationId } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: MAX_ROWS,
        include: { destination: { select: { name: true } }, user: { select: { name: true } } },
      });

      return NextResponse.json({
        rows: transaksis.map((t) => ({
          kodeTransaksi: t.kodeTransaksi,
          destinationName: t.destination.name,
          userName: t.user.name,
          type: t.type,
          totalHarga: Number(t.totalHarga),
          status: t.status,
          createdAt: t.createdAt.toISOString(),
        })),
      });
    }

    default:
      return NextResponse.json({ message: "Tipe detail tidak dikenal." }, { status: 400 });
  }
}
