"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Minus, Wallet, MapPin } from "lucide-react";
import {
  ChartCard,
  EmptyChartState,
  PERIODE_OPTIONS,
  PERIODE_SEBELUMNYA_LABEL,
  PeriodeToggle,
  TrenPendapatanChart,
  BreakdownJenisChart,
  formatRupiah,
  type KeuanganResponse,
  type Periode,
} from "../keuangan-shared";

const KABUPATEN_LABEL: Record<string, string> = {
  SLEMAN: "Sleman",
  GUNUNGKIDUL: "Gunungkidul",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
};

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
  const [data, setData] = useState<KeuanganResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/keuangan?periode=${periode}&destinationId=${destinationId}`)
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
  }, [periode, destinationId]);

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
        <p className="text-sm mb-8" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Pendapatan destinasi ini dari transaksi berstatus Selesai atau Dikonfirmasi
        </p>

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
          <ChartCard title="Breakdown Pendapatan per Jenis">
            {data ? <BreakdownJenisChart data={data.perJenis} /> : <EmptyChartState message="Memuat..." />}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
