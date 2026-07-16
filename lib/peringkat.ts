import { prisma } from "@/lib/prisma";
import type { RouteStatus } from "@/lib/generated/prisma/enums";
import type { AdminFilters } from "@/lib/admin-filters";
import { getKondisiJalanTerakhirMap } from "@/lib/kondisi-jalan";

export type PeringkatDestinasi = {
  id: string;
  name: string;
  kabupaten: string;
  jumlahKunjungan: number;
  rataRataRating: number;
  totalReview: number;
};

/** Peringkat keramaian — jumlahKunjungan pakai definisi yang sama dengan app/api/admin/kunjungan (TIKET_MASUK + SELESAI) */
export async function getPeringkatDestinasi(): Promise<PeringkatDestinasi[]> {
  const [destinations, kunjunganGroups, reviewGroups] = await Promise.all([
    prisma.destination.findMany({
      where: { status: "APPROVED" },
      select: { id: true, name: true, kabupaten: true },
    }),
    prisma.transaksi.groupBy({
      by: ["destinationId"],
      where: { type: "TIKET_MASUK", status: "SELESAI" },
      _count: { _all: true },
    }),
    prisma.review.groupBy({
      by: ["destinationId"],
      _count: { _all: true },
      _avg: { rating: true },
    }),
  ]);

  const kunjunganMap = new Map(kunjunganGroups.map((g) => [g.destinationId, g._count._all]));
  const reviewMap = new Map(reviewGroups.map((g) => [g.destinationId, { total: g._count._all, avg: g._avg.rating }]));

  return destinations
    .map((d) => {
      const review = reviewMap.get(d.id);
      return {
        id: d.id,
        name: d.name,
        kabupaten: d.kabupaten,
        jumlahKunjungan: kunjunganMap.get(d.id) ?? 0,
        rataRataRating: review?.avg != null ? Number(review.avg.toFixed(1)) : 0,
        totalReview: review?.total ?? 0,
      };
    })
    .sort((a, b) => b.jumlahKunjungan - a.jumlahKunjungan);
}

export type KlasifikasiPrioritas = "PERLU_INVESTIGASI" | "PEMELIHARAAN_RUTIN";

export type PrioritasInvestigasi = {
  id: string;
  name: string;
  kabupaten: string;
  /** Kunjungan (TIKET_MASUK + SELESAI) dalam 30 hari terakhir */
  jumlahKunjungan: number;
  /** Kondisi jalan terakhir dilaporkan (30 hari); fallback ke routeStatus destinasi */
  kondisiJalanTerakhir: RouteStatus;
  klasifikasi: KlasifikasiPrioritas;
};

const HARI_30_MS = 30 * 24 * 60 * 60 * 1000;
const KONDISI_JALAN_BURUK: RouteStatus[] = ["RUSAK", "SULIT"];

/**
 * Prioritas investigasi — kebalikan dari Peringkat Keramaian: destinasi APPROVED
 * diurutkan dari kunjungan PALING SEDIKIT ke PALING BANYAK (30 hari terakhir).
 * Destinasi dengan kunjungan di bawah rata-rata keseluruhan DAN ada laporan
 * kondisi jalan RUSAK/SULIT dalam 30 hari terakhir → "Perlu Investigasi".
 */
export async function getPrioritasInvestigasi(
  filters: AdminFilters = { kabupaten: null, kondisiJalan: null }
): Promise<PrioritasInvestigasi[]> {
  const sejak30Hari = new Date(Date.now() - HARI_30_MS);

  const [destinations, kunjunganGroups, laporanJalan] = await Promise.all([
    prisma.destination.findMany({
      // Filter kabupaten di query; kondisi jalan difilter dari laporan warga (di bawah).
      where: { status: "APPROVED", ...(filters.kabupaten ? { kabupaten: filters.kabupaten } : {}) },
      select: { id: true, name: true, kabupaten: true, routeStatus: true },
    }),
    prisma.transaksi.groupBy({
      by: ["destinationId"],
      where: { type: "TIKET_MASUK", status: "SELESAI", createdAt: { gte: sejak30Hari } },
      _count: { _all: true },
    }),
    prisma.userReport.findMany({
      where: { createdAt: { gte: sejak30Hari } },
      select: { destinationId: true, roadCondition: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const kunjunganMap = new Map(kunjunganGroups.map((g) => [g.destinationId, g._count._all]));

  // Kondisi jalan terakhir = laporan warga terbaru (semua waktu), sama dengan halaman Infrastruktur.
  const kondisiMap = await getKondisiJalanTerakhirMap(destinations.map((d) => d.id));

  // Flag "ada jalan buruk" tetap memakai jendela 30 hari (untuk klasifikasi Perlu Investigasi).
  const adaJalanBurukMap = new Map<string, boolean>();
  for (const laporan of laporanJalan) {
    if (KONDISI_JALAN_BURUK.includes(laporan.roadCondition)) {
      adaJalanBurukMap.set(laporan.destinationId, true);
    }
  }

  const rows = destinations.map((d) => ({
    id: d.id,
    name: d.name,
    kabupaten: d.kabupaten,
    jumlahKunjungan: kunjunganMap.get(d.id) ?? 0,
    kondisiJalanTerakhir: kondisiMap.get(d.id) ?? d.routeStatus,
    adaJalanBuruk: adaJalanBurukMap.get(d.id) ?? false,
  }));

  // Rata-rata keseluruhan dihitung dari semua destinasi (kabupaten terpilih), sebelum filter kondisi jalan.
  const rataRataKunjungan =
    rows.length > 0 ? rows.reduce((sum, r) => sum + r.jumlahKunjungan, 0) / rows.length : 0;

  const hasil = rows.map(({ adaJalanBuruk, ...r }) => ({
    ...r,
    klasifikasi: (r.jumlahKunjungan < rataRataKunjungan && adaJalanBuruk
      ? "PERLU_INVESTIGASI"
      : "PEMELIHARAAN_RUTIN") as KlasifikasiPrioritas,
  }));

  // Filter kondisi jalan dicocokkan ke kondisi jalan terakhir yang dilaporkan warga
  // (kolom "Kondisi Jalan Terakhir"), bukan field routeStatus resmi.
  const terfilter = filters.kondisiJalan
    ? hasil.filter((r) => r.kondisiJalanTerakhir === filters.kondisiJalan)
    : hasil;

  return terfilter.sort((a, b) => a.jumlahKunjungan - b.jumlahKunjungan);
}
