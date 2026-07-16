import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { requireAdminPage } from "@/lib/auth-helpers";
import { getPrioritasInvestigasi } from "@/lib/peringkat";
import type { RouteStatus } from "@/lib/generated/prisma/enums";
import type { KlasifikasiPrioritas } from "@/lib/peringkat";
import { parseAdminFilters } from "@/lib/admin-filters";
import AdminFilterBar from "@/components/admin/admin-filter-bar";
import AdminExportButton, { type ExportColumn } from "@/components/admin-export-button";

export const dynamic = "force-dynamic";

// Label klasifikasi tanpa emoji untuk ekspor (font PDF tidak merender emoji).
const KLASIFIKASI_EXPORT_LABEL: Record<KlasifikasiPrioritas, string> = {
  PERLU_INVESTIGASI: "Perlu Investigasi",
  PEMELIHARAAN_RUTIN: "Pemeliharaan Rutin",
};

type PrioritasExportRow = {
  nama: string;
  kabupaten: string;
  kunjungan: number;
  kondisiJalan: string;
  klasifikasi: string;
};

// Kolom polos (tanpa fungsi) supaya aman dilewatkan dari Server ke Client Component.
const PRIORITAS_EXPORT_COLUMNS: ExportColumn<PrioritasExportRow>[] = [
  { key: "nama", header: "Nama" },
  { key: "kabupaten", header: "Kabupaten" },
  { key: "kunjungan", header: "Kunjungan (30 hari)" },
  { key: "kondisiJalan", header: "Kondisi Jalan Terakhir" },
  { key: "klasifikasi", header: "Klasifikasi" },
];

const KABUPATEN_LABEL: Record<string, string> = {
  SLEMAN: "Sleman",
  GUNUNGKIDUL: "Gunungkidul",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
};

const KONDISI_JALAN: Record<RouteStatus, { label: string; color: string }> = {
  MUDAH: { label: "Mudah", color: "#2e7d32" },
  SEDANG: { label: "Sedang", color: "#b26a00" },
  SULIT: { label: "Sulit", color: "#c0392b" },
  RUSAK: { label: "Rusak", color: "#c0392b" },
  BELUM_ADA_DATA: { label: "Belum ada data", color: "var(--blusukan-on-surface-variant)" },
};

const KLASIFIKASI_BADGE: Record<KlasifikasiPrioritas, { label: string; bg: string; color: string }> = {
  PERLU_INVESTIGASI: { label: "🔴 Perlu Investigasi", bg: "#fdecea", color: "#c0392b" },
  PEMELIHARAAN_RUTIN: { label: "🟢 Pemeliharaan Rutin", bg: "#e8f5e9", color: "#2e7d32" },
};

export default async function PrioritasInvestigasiPage({
  searchParams,
}: {
  searchParams: Promise<{ kabupaten?: string; kondisiJalan?: string }>;
}) {
  await requireAdminPage();

  const filters = parseAdminFilters(await searchParams);
  const prioritas = await getPrioritasInvestigasi(filters);

  const exportRows: PrioritasExportRow[] = prioritas.map((d) => ({
    nama: d.name,
    kabupaten: KABUPATEN_LABEL[d.kabupaten] ?? d.kabupaten,
    kunjungan: d.jumlahKunjungan,
    kondisiJalan: KONDISI_JALAN[d.kondisiJalanTerakhir]?.label ?? d.kondisiJalanTerakhir,
    klasifikasi: KLASIFIKASI_EXPORT_LABEL[d.klasifikasi],
  }));

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
        <Link
          href="/dashboard"
          id="prioritas-back"
          className="flex items-center gap-1.5 text-sm font-semibold mb-6 hover:opacity-70 transition-opacity"
          style={{ color: "var(--blusukan-primary)" }}
        >
          ← Kembali ke Dashboard
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2">
            <AlertTriangle size={22} style={{ color: "var(--blusukan-primary)" }} />
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
            >
              Prioritas Investigasi
            </h1>
          </div>
          <AdminExportButton
            data={exportRows}
            columns={PRIORITAS_EXPORT_COLUMNS}
            filenameBase="prioritas-investigasi"
            title="Prioritas Investigasi"
          />
        </div>
        <p className="text-sm mb-5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Diurutkan dari kunjungan paling sedikit (30 hari) — destinasi sepi dengan kondisi jalan buruk perlu ditinjau
        </p>

        <AdminFilterBar className="mb-8" />

        {prioritas.length === 0 ? (
          <div
            className="rounded-2xl p-10 flex flex-col items-center text-center"
            style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            <AlertTriangle size={40} style={{ color: "var(--blusukan-outline)" }} className="mb-3" />
            <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Belum ada destinasi yang disetujui
            </p>
          </div>
        ) : (
          <div
            className="rounded-2xl overflow-x-auto"
            style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            <table className="w-full text-sm" style={{ borderCollapse: "collapse", minWidth: "640px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--blusukan-outline-variant)" }}>
                  <th className="text-left font-semibold px-5 py-3" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    Nama
                  </th>
                  <th className="text-left font-semibold px-5 py-3" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    Kabupaten
                  </th>
                  <th className="text-right font-semibold px-5 py-3" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    Kunjungan (30 hari)
                  </th>
                  <th className="text-left font-semibold px-5 py-3" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    Kondisi Jalan Terakhir
                  </th>
                  <th className="text-left font-semibold px-5 py-3" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    Klasifikasi
                  </th>
                </tr>
              </thead>
              <tbody>
                {prioritas.map((d, idx) => {
                  const kondisi = KONDISI_JALAN[d.kondisiJalanTerakhir];
                  const badge = KLASIFIKASI_BADGE[d.klasifikasi];
                  return (
                    <tr
                      key={d.id}
                      id={`row-prioritas-${d.id}`}
                      className="transition-colors hover:bg-[#f7f8f5] cursor-pointer"
                      style={{ borderTop: idx === 0 ? "none" : "1px solid var(--blusukan-outline-variant)" }}
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/dashboard/destinasi/${d.id}`}
                          id={`link-prioritas-${d.id}`}
                          className="font-bold hover:underline"
                          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
                        >
                          {d.name}
                        </Link>
                      </td>
                      <td className="px-5 py-4" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                        {KABUPATEN_LABEL[d.kabupaten] ?? d.kabupaten}
                      </td>
                      <td className="px-5 py-4 text-right font-bold" style={{ color: "var(--blusukan-primary)" }}>
                        {d.jumlahKunjungan}
                      </td>
                      <td className="px-5 py-4 font-semibold" style={{ color: kondisi.color }}>
                        {kondisi.label}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
