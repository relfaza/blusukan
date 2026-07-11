"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, ArrowUpDown, Minus, Wallet, MapPin } from "lucide-react";
import {
  ChartCard,
  EmptyChartState,
  PERIODE_OPTIONS,
  PERIODE_SEBELUMNYA_LABEL,
  PeriodeToggle,
  TrenPendapatanChart,
  BreakdownJenisChart,
  TYPE_LABEL,
  formatRupiah,
  type KeuanganResponse,
  type Periode,
} from "../keuangan-shared";
import DaftarTransaksiSection from "./DaftarTransaksiSection";

const KABUPATEN_LABEL: Record<string, string> = {
  SLEMAN: "Sleman",
  GUNUNGKIDUL: "Gunungkidul",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
};

const JENIS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Semua Jenis" },
  { value: "TIKET_MASUK", label: TYPE_LABEL.TIKET_MASUK },
  { value: "FASILITAS", label: TYPE_LABEL.FASILITAS },
  { value: "UMKM", label: TYPE_LABEL.UMKM },
];

const TYPE_ORDER = ["TIKET_MASUK", "FASILITAS", "UMKM"];

function FilterChipRow({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            id={`filter-jenis-${opt.value || "semua"}`}
            onClick={() => onChange(opt.value)}
            className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-colors"
            style={
              active
                ? { background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)", border: "1px solid var(--blusukan-primary)" }
                : { background: "#ffffff", color: "var(--blusukan-on-surface)", border: "1px solid var(--blusukan-outline-variant)" }
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function BreakdownJenisList({ data, sortByKontribusi }: { data: KeuanganResponse["perJenis"]; sortByKontribusi: boolean }) {
  if (data.length === 0 || data.every((d) => d.totalPendapatan === 0)) {
    return (
      <p className="text-sm py-4 text-center" style={{ color: "var(--blusukan-on-surface-variant)" }}>
        Data belum cukup untuk ditampilkan
      </p>
    );
  }

  const total = data.reduce((sum, d) => sum + d.totalPendapatan, 0);
  const sorted = sortByKontribusi
    ? [...data].sort((a, b) => b.totalPendapatan - a.totalPendapatan)
    : [...data].sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type));

  return (
    <div className="space-y-3">
      {sorted.map((d) => {
        const persen = total > 0 ? Math.round((d.totalPendapatan / total) * 100) : 0;
        return (
          <div key={d.type}>
            <div className="flex items-center justify-between gap-3 mb-1">
              <p className="text-xs font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
                {TYPE_LABEL[d.type] ?? d.type}
              </p>
              <p className="text-xs font-bold shrink-0" style={{ color: "var(--blusukan-primary)" }}>
                {formatRupiah(d.totalPendapatan)} · {persen}%
              </p>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--blusukan-surface)" }}>
              <div className="h-full rounded-full" style={{ width: `${persen}%`, background: "var(--blusukan-primary)" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function KeuanganDestinasiClient({
  destinationId,
  destinationName,
  kabupaten,
}: {
  destinationId: string;
  destinationName: string;
  kabupaten: string;
}) {
  const [periode, setPeriode] = useState<Periode>("harian");
  const [jenis, setJenis] = useState("");
  const [sortByKontribusi, setSortByKontribusi] = useState(true);
  const [data, setData] = useState<KeuanganResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ periode, destinationId });
    if (jenis) params.set("jenis", jenis);
    fetch(`/api/admin/keuangan?${params.toString()}`)
      .then((res) => res.json())
      .then((json: KeuanganResponse) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat data keuangan.");
      });
    return () => {
      cancelled = true;
    };
  }, [periode, destinationId, jenis]);

  const naik = (data?.persenPerubahan ?? 0) > 0;
  const turun = (data?.persenPerubahan ?? 0) < 0;
  const trendColor = naik ? "var(--blusukan-primary)" : turun ? "var(--blusukan-error)" : "var(--blusukan-on-surface-variant)";
  const trendBg = naik ? "var(--blusukan-primary-container)" : turun ? "var(--blusukan-error-container)" : "var(--blusukan-surface)";

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
        <Link
          href="/dashboard/keuangan"
          id="keuangan-destinasi-back"
          className="flex items-center gap-1.5 text-sm font-semibold mb-6 hover:opacity-70 transition-opacity"
          style={{ color: "var(--blusukan-primary)" }}
        >
          <ArrowLeft size={16} />
          Kembali ke Dashboard Keuangan
        </Link>

        <div className="flex items-center gap-1.5 mb-1.5">
          <MapPin size={14} style={{ color: "var(--blusukan-on-surface-variant)" }} />
          <span className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            {KABUPATEN_LABEL[kabupaten] ?? kabupaten}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
            {destinationName}
          </h1>
          <PeriodeToggle value={periode} onChange={setPeriode} />
        </div>
        <p className="text-sm mb-4" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Pendapatan destinasi ini dari transaksi berstatus Selesai atau Dikonfirmasi
        </p>

        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Jenis Transaksi
          </h2>
          <FilterChipRow options={JENIS_OPTIONS} value={jenis} onChange={setJenis} />
        </section>

        {error && (
          <p className="text-sm px-4 py-2.5 rounded-lg mb-4" style={{ background: "var(--blusukan-error-container)", color: "var(--blusukan-error)" }}>
            {error}
          </p>
        )}

        {/* KPI besar */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}>
              <Wallet size={18} />
            </div>
            <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Total Pendapatan ({PERIODE_OPTIONS.find((p) => p.value === periode)?.label})
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <p className="text-3xl font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
              {data ? formatRupiah(data.totalPeriodeIni) : "–"}
            </p>
            {data && (
              <span
                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap mb-1"
                style={{ background: trendBg, color: trendColor }}
              >
                {naik ? <ArrowUpRight size={13} /> : turun ? <ArrowDownRight size={13} /> : <Minus size={13} />}
                {Math.abs(data.persenPerubahan)}% dari {PERIODE_SEBELUMNYA_LABEL[periode]}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Tren Pendapatan">
            {data ? <TrenPendapatanChart data={data.tren} /> : <EmptyChartState message="Memuat..." />}
          </ChartCard>
          <div className="rounded-2xl p-5" style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
                Breakdown Pendapatan per Jenis
              </h3>
              <button
                type="button"
                id="toggle-sort-breakdown-jenis"
                onClick={() => setSortByKontribusi((prev) => !prev)}
                className="shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-opacity hover:opacity-90"
                style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
              >
                <ArrowUpDown size={12} />
                {sortByKontribusi ? "Kontribusi Terbesar" : "Urutan Standar"}
              </button>
            </div>
            {data ? <BreakdownJenisChart data={data.perJenis} /> : <EmptyChartState message="Memuat..." />}
            <div className="mt-4 pt-4" style={{ borderTop: "1px dashed var(--blusukan-outline-variant)" }}>
              {data ? (
                <BreakdownJenisList data={data.perJenis} sortByKontribusi={sortByKontribusi} />
              ) : (
                <p className="text-sm py-4 text-center" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                  Memuat...
                </p>
              )}
            </div>
          </div>
        </div>

        <DaftarTransaksiSection destinationId={destinationId} />
      </div>
    </div>
  );
}
