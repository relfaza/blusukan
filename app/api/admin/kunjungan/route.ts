import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { buildBucketsForPeriode } from "@/lib/kunjunganBuckets";
import { destinationRelationWhere, parseAdminFilters } from "@/lib/admin-filters";

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

  // Filter kabupaten/kondisiJalan hanya relevan saat tidak dibatasi ke satu destinasi.
  const filterWhere = destinationId
    ? {}
    : destinationRelationWhere(
        parseAdminFilters({
          kabupaten: searchParams.get("kabupaten"),
          kondisiJalan: searchParams.get("kondisiJalan"),
        })
      );

  const now = new Date();
  const buckets = buildBucketsForPeriode(periode as "harian" | "mingguan" | "bulanan", now);

  const rangeStart = buckets[0].start;

  const transaksis = await prisma.transaksi.findMany({
    where: {
      type: "TIKET_MASUK",
      status: "SELESAI",
      selesaiAt: { gte: rangeStart, not: null },
      ...(destinationId ? { destinationId } : {}),
      ...filterWhere,
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
