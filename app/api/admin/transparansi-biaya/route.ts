import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { destinationFilterWhere, destinationRelationWhere, parseAdminFilters } from "@/lib/admin-filters";

// Ambang selisih harga dianggap "tidak sesuai": > 20% dari HTM resmi (definisi PRD).
const SELISIH_THRESHOLD = 0.2;
// Jumlah laporan tidak sesuai dalam 30 hari yang memicu status potensi pungli (definisi PRD).
const PUNGLI_MIN_LAPORAN = 3;

export async function GET(request: Request) {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { searchParams } = new URL(request.url);
  const filters = parseAdminFilters({
    kabupaten: searchParams.get("kabupaten"),
    kondisiJalan: searchParams.get("kondisiJalan"),
  });

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const destinasi = await prisma.destination.findMany({
    where: { status: "APPROVED", ...destinationFilterWhere(filters) },
    select: { id: true, name: true, kabupaten: true, htmResmi: true },
    orderBy: { name: "asc" },
  });

  // Semua laporan 30 hari terakhir yang mengisi reportedFee, sekali query lalu dikelompokkan per destinasi.
  const reports = await prisma.userReport.findMany({
    where: {
      destinationId: { in: destinasi.map((d) => d.id) },
      reportedFee: { not: null },
      createdAt: { gte: since },
    },
    select: { destinationId: true, reportedFee: true },
  });

  const reportsByDest = new Map<string, number[]>();
  for (const r of reports) {
    if (r.reportedFee == null) continue;
    const arr = reportsByDest.get(r.destinationId) ?? [];
    arr.push(Number(r.reportedFee));
    reportsByDest.set(r.destinationId, arr);
  }

  const rows = destinasi.map((d) => {
    const htmResmi = Number(d.htmResmi);
    const fees = reportsByDest.get(d.id) ?? [];
    const jumlahLaporan = fees.length;

    const rataRataReportedFee =
      jumlahLaporan > 0 ? Math.round(fees.reduce((s, f) => s + f, 0) / jumlahLaporan) : null;

    // Laporan "tidak sesuai": selisih > 20% dari HTM resmi. Kalau HTM resmi 0,
    // setiap laporan berbiaya > 0 dianggap tidak sesuai (tidak ada acuan tarif resmi).
    const jumlahLaporanTidakSesuai = fees.filter((f) =>
      htmResmi > 0 ? Math.abs(f - htmResmi) / htmResmi > SELISIH_THRESHOLD : f > 0
    ).length;

    const statusPungli = jumlahLaporanTidakSesuai >= PUNGLI_MIN_LAPORAN;

    const selisihPersen =
      rataRataReportedFee != null && htmResmi > 0
        ? Number((((rataRataReportedFee - htmResmi) / htmResmi) * 100).toFixed(1))
        : null;

    return {
      id: d.id,
      name: d.name,
      kabupaten: d.kabupaten,
      htmResmi,
      rataRataReportedFee,
      jumlahLaporan,
      jumlahLaporanTidakSesuai,
      selisihPersen,
      statusPungli,
    };
  });

  // Section 2: warung + menu, dikelompokkan per destinasi (ikut filter Kabupaten/Kondisi Jalan).
  const warungs = await prisma.localWarung.findMany({
    where: { ...destinationRelationWhere(filters) },
    select: {
      id: true,
      name: true,
      kategori: true,
      destination: { select: { id: true, name: true, kabupaten: true } },
      menuItems: { select: { id: true, name: true, price: true }, orderBy: { price: "asc" } },
    },
    orderBy: { name: "asc" },
  });

  const warungRows = warungs.map((w) => ({
    id: w.id,
    name: w.name,
    kategori: w.kategori,
    destinationId: w.destination.id,
    destinationName: w.destination.name,
    kabupaten: w.destination.kabupaten,
    menu: w.menuItems.map((m) => ({ id: m.id, name: m.name, price: Number(m.price) })),
  }));

  return NextResponse.json({ destinasi: rows, warungs: warungRows });
}
