"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Store, ShieldAlert, ShieldCheck } from "lucide-react";
import AdminFilterBar from "@/components/admin/admin-filter-bar";
import AdminExportButton, { type ExportColumn } from "@/components/admin-export-button";

const KABUPATEN_LABEL: Record<string, string> = {
  SLEMAN: "Sleman",
  GUNUNGKIDUL: "Gunungkidul",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
};

const KATEGORI_UMKM_LABEL: Record<string, string> = {
  KULINER: "Kuliner",
  KERAJINAN: "Kerajinan",
  FASHION: "Fashion",
  JASA: "Jasa",
  LAINNYA: "Lainnya",
};

type DestinasiRow = {
  id: string;
  name: string;
  kabupaten: string;
  htmResmi: number;
  rataRataReportedFee: number | null;
  jumlahLaporan: number;
  jumlahLaporanTidakSesuai: number;
  selisihPersen: number | null;
  statusPungli: boolean;
};

type MenuRow = { id: string; name: string; price: number };

type WarungRow = {
  id: string;
  name: string;
  kategori: string;
  destinationId: string;
  destinationName: string;
  kabupaten: string;
  menu: MenuRow[];
};

type Response = { destinasi: DestinasiRow[]; warungs: WarungRow[] };

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatHtm(n: number): string {
  return n <= 0 ? "Gratis" : formatRupiah(n);
}

function kabupatenLabel(k: string): string {
  return KABUPATEN_LABEL[k] ?? k;
}

function SectionTitle({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2
        className="text-lg font-bold"
        style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
      >
        {children}
      </h2>
      {subtitle && (
        <p className="text-sm mt-0.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function StatusBadge({ row }: { row: DestinasiRow }) {
  if (row.jumlahLaporan === 0) {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
        style={{ background: "var(--blusukan-surface)", color: "var(--blusukan-on-surface-variant)" }}
      >
        Belum ada laporan
      </span>
    );
  }
  if (row.statusPungli) {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
        style={{ background: "var(--blusukan-error-container)", color: "var(--blusukan-error)" }}
        title={`${row.jumlahLaporanTidakSesuai} laporan tidak sesuai dalam 30 hari`}
      >
        <ShieldAlert size={13} />
        Potensi Pungli
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
    >
      <ShieldCheck size={13} />
      Sesuai
    </span>
  );
}

function SelisihCell({ row }: { row: DestinasiRow }) {
  if (row.selisihPersen == null) {
    return <span style={{ color: "var(--blusukan-on-surface-variant)" }}>–</span>;
  }
  const positif = row.selisihPersen > 0;
  const netral = row.selisihPersen === 0;
  const color = netral
    ? "var(--blusukan-on-surface-variant)"
    : positif
      ? "var(--blusukan-error)"
      : "var(--blusukan-primary)";
  const sign = positif ? "+" : "";
  return (
    <span className="font-semibold" style={{ color }}>
      {sign}
      {row.selisihPersen}%
    </span>
  );
}

const thStyle = "text-left text-xs font-bold uppercase tracking-wide px-4 py-3 whitespace-nowrap";
const tdStyle = "px-4 py-3 text-sm whitespace-nowrap";

const EXPORT_COLUMNS: ExportColumn<DestinasiRow>[] = [
  { key: "name", header: "Nama Destinasi" },
  { key: "kabupaten", header: "Kabupaten", format: (r) => kabupatenLabel(r.kabupaten) },
  { key: "htmResmi", header: "HTM Resmi", format: (r) => formatHtm(r.htmResmi) },
  {
    key: "rataRataReportedFee",
    header: "Rata-rata Dilaporkan",
    format: (r) => (r.rataRataReportedFee != null ? formatRupiah(r.rataRataReportedFee) : "-"),
  },
  { key: "jumlahLaporan", header: "Jumlah Laporan", format: (r) => String(r.jumlahLaporan) },
  { key: "selisihPersen", header: "Selisih (%)", format: (r) => (r.selisihPersen != null ? `${r.selisihPersen}%` : "-") },
  {
    key: "statusPungli",
    header: "Status",
    format: (r) => (r.jumlahLaporan === 0 ? "Belum ada laporan" : r.statusPungli ? "Potensi Pungli" : "Sesuai"),
  },
];

export default function TransparansiBiayaClient() {
  const [data, setData] = useState<Response | null>(null);
  const [error, setError] = useState("");

  const searchParams = useSearchParams();
  const kabupaten = searchParams.get("kabupaten");
  const kondisiJalan = searchParams.get("kondisiJalan");

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (kabupaten) params.set("kabupaten", kabupaten);
    if (kondisiJalan) params.set("kondisiJalan", kondisiJalan);
    const qs = params.toString();

    fetch(`/api/admin/transparansi-biaya${qs ? `?${qs}` : ""}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json: Response) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat data transparansi biaya.");
      });
    return () => {
      cancelled = true;
    };
  }, [kabupaten, kondisiJalan]);

  // Kelompokkan warung per destinasi untuk Section 2.
  const warungPerDestinasi = (() => {
    if (!data) return [];
    const map = new Map<string, { name: string; kabupaten: string; warungs: WarungRow[] }>();
    for (const w of data.warungs) {
      const existing = map.get(w.destinationId);
      if (existing) existing.warungs.push(w);
      else map.set(w.destinationId, { name: w.destinationName, kabupaten: w.kabupaten, warungs: [w] });
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  })();

  const jumlahPungli = data?.destinasi.filter((d) => d.statusPungli).length ?? 0;

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
          >
            Transparansi Biaya
          </h1>
          <AdminExportButton
            data={data?.destinasi ?? []}
            columns={EXPORT_COLUMNS}
            filenameBase="transparansi-biaya"
            title="Transparansi Biaya — HTM vs Laporan Aktual"
          />
        </div>
        <p className="text-sm mb-5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Perbandingan tarif resmi dengan biaya yang dilaporkan wisatawan, serta daftar harga warung.
        </p>

        <AdminFilterBar showKondisiJalan={false} className="mb-8" />

        {error && (
          <p
            className="text-sm px-4 py-2.5 rounded-lg mb-8"
            style={{ background: "var(--blusukan-error-container)", color: "var(--blusukan-error)" }}
          >
            {error}
          </p>
        )}

        {!data && !error && (
          <div
            className="rounded-2xl h-64 animate-pulse mb-8"
            style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
          />
        )}

        {data && (
          <>
            {/* ── Section 1: HTM Resmi vs Laporan Aktual ── */}
            <section className="mb-12">
              <SectionTitle
                subtitle={
                  jumlahPungli > 0
                    ? `${jumlahPungli} destinasi terindikasi potensi pungli (≥ 3 laporan tidak sesuai dalam 30 hari)`
                    : "Selisih dihitung dari rata-rata biaya yang dilaporkan wisatawan (30 hari terakhir)"
                }
              >
                HTM Resmi vs Laporan Aktual
              </SectionTitle>

              {data.destinasi.length === 0 ? (
                <div
                  className="rounded-2xl p-10 text-center"
                  style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
                >
                  <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    Belum ada destinasi yang disetujui.
                  </p>
                </div>
              ) : (
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr style={{ background: "var(--blusukan-surface)" }}>
                          <th className={thStyle} style={{ color: "var(--blusukan-on-surface-variant)" }}>
                            Nama Destinasi
                          </th>
                          <th className={thStyle} style={{ color: "var(--blusukan-on-surface-variant)" }}>
                            Kabupaten
                          </th>
                          <th className={thStyle} style={{ color: "var(--blusukan-on-surface-variant)" }}>
                            HTM Resmi
                          </th>
                          <th className={thStyle} style={{ color: "var(--blusukan-on-surface-variant)" }}>
                            Rata-rata Dilaporkan
                          </th>
                          <th className={thStyle} style={{ color: "var(--blusukan-on-surface-variant)" }}>
                            Selisih
                          </th>
                          <th className={thStyle} style={{ color: "var(--blusukan-on-surface-variant)" }}>
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.destinasi.map((row, idx) => (
                          <tr
                            key={row.id}
                            style={{
                              borderTop: idx === 0 ? "none" : "1px solid var(--blusukan-outline-variant)",
                              background: row.statusPungli
                                ? "color-mix(in srgb, var(--blusukan-error) 5%, transparent)"
                                : "transparent",
                            }}
                          >
                            <td className={tdStyle}>
                              <span className="font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
                                {row.name}
                              </span>
                            </td>
                            <td className={tdStyle} style={{ color: "var(--blusukan-on-surface-variant)" }}>
                              {kabupatenLabel(row.kabupaten)}
                            </td>
                            <td className={tdStyle} style={{ color: "var(--blusukan-on-surface)" }}>
                              {formatHtm(row.htmResmi)}
                            </td>
                            <td className={tdStyle} style={{ color: "var(--blusukan-on-surface)" }}>
                              {row.rataRataReportedFee != null ? (
                                <>
                                  {formatRupiah(row.rataRataReportedFee)}
                                  <span className="text-xs ml-1" style={{ color: "var(--blusukan-outline)" }}>
                                    ({row.jumlahLaporan} laporan)
                                  </span>
                                </>
                              ) : (
                                <span style={{ color: "var(--blusukan-on-surface-variant)" }}>–</span>
                              )}
                            </td>
                            <td className={tdStyle}>
                              <SelisihCell row={row} />
                            </td>
                            <td className={tdStyle}>
                              <StatusBadge row={row} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            {/* ── Section 2: Daftar Menu & Harga Warung ── */}
            <section>
              <SectionTitle subtitle="Harga menu UMKM/warung lokal per destinasi">
                Daftar Menu &amp; Harga Warung
              </SectionTitle>

              {warungPerDestinasi.length === 0 ? (
                <div
                  className="rounded-2xl p-10 text-center"
                  style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
                >
                  <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    Belum ada warung terdaftar.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {warungPerDestinasi.map((grup) => (
                    <div
                      key={grup.name + grup.kabupaten}
                      className="rounded-2xl overflow-hidden"
                      style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
                    >
                      <div
                        className="px-5 py-3 border-b"
                        style={{ background: "var(--blusukan-surface)", borderColor: "var(--blusukan-outline-variant)" }}
                      >
                        <p
                          className="text-sm font-bold"
                          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
                        >
                          {grup.name}
                        </p>
                        <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                          {kabupatenLabel(grup.kabupaten)} · {grup.warungs.length} warung
                        </p>
                      </div>

                      <div className="divide-y" style={{ borderColor: "var(--blusukan-outline-variant)" }}>
                        {grup.warungs.map((w) => (
                          <div key={w.id} className="px-5 py-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
                              >
                                <Store size={15} />
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold truncate" style={{ color: "var(--blusukan-on-surface)" }}>
                                  {w.name}
                                </p>
                                <p className="text-xs" style={{ color: "var(--blusukan-outline)" }}>
                                  {KATEGORI_UMKM_LABEL[w.kategori] ?? w.kategori}
                                </p>
                              </div>
                            </div>

                            {w.menu.length === 0 ? (
                              <p className="text-xs pl-10" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                                Belum ada menu terdaftar.
                              </p>
                            ) : (
                              <ul className="pl-10 space-y-1">
                                {w.menu.map((m) => (
                                  <li key={m.id} className="flex items-center justify-between gap-4 text-sm">
                                    <span style={{ color: "var(--blusukan-on-surface)" }}>{m.name}</span>
                                    <span className="font-semibold shrink-0" style={{ color: "var(--blusukan-primary)" }}>
                                      {formatRupiah(m.price)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
