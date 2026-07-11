"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Minus, Wallet, Receipt, TrendingUp, ChevronRight } from "lucide-react";
import type { PeringkatKeuangan } from "@/lib/peringkat-keuangan";
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
} from "./keuangan-shared";

export default function KeuanganDashboardClient({ semuaDestinasiKeuangan }: { semuaDestinasiKeuangan: PeringkatKeuangan[] }) {
  const [periode, setPeriode] = useState<Periode>("harian");
  const [data, setData] = useState<KeuanganResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/keuangan?periode=${periode}`)
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
  }, [periode]);

  const naik = (data?.persenPerubahan ?? 0) > 0;
  const turun = (data?.persenPerubahan ?? 0) < 0;
  const trendColor = naik ? "var(--blusukan-primary)" : turun ? "var(--blusukan-error)" : "var(--blusukan-on-surface-variant)";
  const trendBg = naik ? "var(--blusukan-primary-container)" : turun ? "var(--blusukan-error-container)" : "var(--blusukan-surface)";

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link
            href="/dashboard"
            id="keuangan-back"
            className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity"
            style={{ color: "var(--blusukan-primary)" }}
          >
            <ArrowLeft size={16} />
            Kembali ke Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/peringkat-keuangan"
              id="link-lihat-peringkat-keuangan"
              className="flex items-center gap-1 text-xs font-semibold hover:opacity-70 transition-opacity"
              style={{ color: "var(--blusukan-primary)" }}
            >
              <TrendingUp size={13} />
              Peringkat Pendapatan
              <ChevronRight size={13} />
            </Link>
            <Link
              href="/dashboard/transaksi"
              id="link-lihat-semua-transaksi"
              className="text-xs font-semibold hover:opacity-70 transition-opacity"
              style={{ color: "var(--blusukan-on-surface-variant)" }}
            >
              Lihat semua transaksi (detail) →
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
            Dashboard Keuangan
          </h1>
          <PeriodeToggle value={periode} onChange={setPeriode} />
        </div>
        <p className="text-sm mb-8" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Pendapatan dari transaksi berstatus Selesai atau Dikonfirmasi
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <ChartCard title="Tren Pendapatan">
            {data ? <TrenPendapatanChart data={data.tren} /> : <EmptyChartState message="Memuat..." />}
          </ChartCard>
          <ChartCard title="Breakdown Pendapatan per Jenis">
            {data ? <BreakdownJenisChart data={data.perJenis} /> : <EmptyChartState message="Memuat..." />}
          </ChartCard>
        </div>

        {/* Top 5 Destinasi Terlaris */}
        <div className="rounded-2xl overflow-hidden mb-6" style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}>
          <div className="px-5 pt-5 pb-1 flex items-center gap-2">
            <Receipt size={16} style={{ color: "var(--blusukan-primary)" }} />
            <h3 className="text-sm font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
              Top 5 Destinasi Terlaris
            </h3>
          </div>
          {!data || data.top5Destinasi.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                {data ? "Belum ada transaksi pada periode ini" : "Memuat..."}
              </p>
            </div>
          ) : (
            <div className="px-2 pb-2">
              {data.top5Destinasi.map((d, idx) => (
                <Link
                  key={d.destinationId}
                  href={`/dashboard/destinasi/${d.destinationId}?from=keuangan`}
                  id={`row-top-destinasi-${d.destinationId}`}
                  className="flex items-center gap-4 px-3 py-3 mt-2 rounded-xl transition-colors hover:bg-[#f7f8f5]"
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{ background: "var(--blusukan-primary)", color: "#ffffff" }}
                  >
                    #{idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
                      {d.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                      {d.jumlahTransaksi} transaksi
                    </p>
                  </div>
                  <p className="text-sm font-bold shrink-0" style={{ color: "var(--blusukan-primary)" }}>
                    {formatRupiah(d.totalPendapatan)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Keuangan per Destinasi */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}>
          <div className="px-5 pt-5 pb-1">
            <h3 className="text-sm font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
              Keuangan per Destinasi
            </h3>
            <p className="text-xs mt-0.5 mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Klik destinasi untuk lihat detail keuangannya
            </p>
          </div>
          {semuaDestinasiKeuangan.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Belum ada destinasi dengan transaksi
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
              {semuaDestinasiKeuangan.map((d) => (
                <Link
                  key={d.id}
                  href={`/dashboard/keuangan/${d.id}`}
                  id={`card-keuangan-destinasi-${d.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-[#f7f8f5]"
                  style={{ border: "1px solid var(--blusukan-outline-variant)" }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
                      {d.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                      {d.jumlahTransaksi} transaksi
                    </p>
                  </div>
                  <p className="text-sm font-bold shrink-0" style={{ color: "var(--blusukan-primary)" }}>
                    {formatRupiah(d.totalPendapatan)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
